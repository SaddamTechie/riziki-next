/**
 * GET    /api/looks/:id  — Get a single look with its items (admin)
 * PATCH  /api/looks/:id  — Update a look (admin)
 * DELETE /api/looks/:id  — Delete a look (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { looks, lookItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { storage } from "@/lib/storage";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  noContent,
  badRequest,
  notFound,
  requireAdmin,
  isErrorResponse,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const updateLookSchema = z
  .object({
    name: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/),
    description: z.string(),
    coverImagePublicId: z.string(),
    coverImageUrl: z.string(),
    coverImageBlurDataUrl: z.string(),
    department: z.enum(["men", "women", "beauty", "all"]),
    isActive: z.boolean(),
    sortOrder: z.number(),
    /** Replace the full product list when provided */
    productIds: z.array(z.string()).max(6),
  })
  .partial();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;
    const [look] = await db
      .select()
      .from(looks)
      .where(eq(looks.id, id))
      .limit(1);

    if (!look) return notFound("Look not found");

    const items = await db
      .select()
      .from(lookItems)
      .where(eq(lookItems.lookId, id));

    return ok({ ...look, items });
  } catch (e) {
    console.error("[look GET]", e);
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLookSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const { productIds, ...lookData } = parsed.data;

    // Update look fields if any non-productIds fields were sent
    let updated: { id: string; department: string } | undefined;
    if (Object.keys(lookData).length > 0) {
      const [row] = await db
        .update(looks)
        .set(lookData)
        .where(eq(looks.id, id))
        .returning({ id: looks.id, department: looks.department });
      updated = row;
    } else {
      const [row] = await db
        .select({ id: looks.id, department: looks.department })
        .from(looks)
        .where(eq(looks.id, id))
        .limit(1);
      updated = row;
    }

    if (!updated) return notFound("Look not found");

    // Replace items if productIds provided
    if (productIds && productIds.length > 0) {
      await db.delete(lookItems).where(eq(lookItems.lookId, id));
      await db.insert(lookItems).values(
        productIds.map((productId, i) => ({
          id: generateId(),
          lookId: id,
          productId,
          sortOrder: i,
        })),
      );
    }

    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(updated.department));

    return ok({ id: updated.id });
  } catch (e) {
    console.error("[look PATCH]", e);
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;
    const [deleted] = await db.delete(looks).where(eq(looks.id, id)).returning({
      id: looks.id,
      department: looks.department,
      coverImagePublicId: looks.coverImagePublicId,
    });

    if (!deleted) return notFound("Look not found");

    // Delete cover image from Cloudinary (fire-and-forget — don't block response)
    if (deleted.coverImagePublicId) {
      storage.delete(deleted.coverImagePublicId).catch((err) => {
        console.error("[look DELETE] cloudinary cleanup failed:", err);
      });
    }

    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(deleted.department));

    return noContent();
  } catch (e) {
    console.error("[look DELETE]", e);
    return serverError();
  }
}
