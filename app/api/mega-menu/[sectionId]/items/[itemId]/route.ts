/**
 * GET    /api/mega-menu/:sectionId/items/:itemId  — Get a single item (admin)
 * PATCH  /api/mega-menu/:sectionId/items/:itemId  — Update an item (admin)
 * DELETE /api/mega-menu/:sectionId/items/:itemId  — Delete an item (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { megaMenuSections, megaMenuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  noContent,
  badRequest,
  notFound,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const updateItemSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
    imagePublicId: z.string().nullish(),
    imageUrl: z.string().nullish(),
    imageBlurDataUrl: z.string().nullish(),
    badge: z.string().nullish(),
    sortOrder: z.number(),
    isActive: z.boolean(),
  })
  .partial();

async function getSectionDepartment(sectionId: string) {
  const [section] = await db
    .select({ department: megaMenuSections.department })
    .from(megaMenuSections)
    .where(eq(megaMenuSections.id, sectionId))
    .limit(1);
  return section?.department ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sectionId: string; itemId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { itemId } = await params;

    const [item] = await db
      .select()
      .from(megaMenuItems)
      .where(eq(megaMenuItems.id, itemId))
      .limit(1);

    if (!item) return notFound("Item not found");

    return ok(item);
  } catch (e) {
    console.error("[mega-menu item GET]", e);
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string; itemId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId, itemId } = await params;
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(megaMenuItems)
      .set(parsed.data)
      .where(eq(megaMenuItems.id, itemId))
      .returning({ id: megaMenuItems.id });

    if (!updated) return notFound("Item not found");

    const department = await getSectionDepartment(sectionId);
    if (department) {
      revalidateTag(CACHE_TAGS.megaMenu(department));
      revalidateTag(CACHE_TAGS.megaMenu("all"));
    }

    return ok({ id: updated.id });
  } catch (e) {
    console.error("[mega-menu item PATCH]", e);
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sectionId: string; itemId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId, itemId } = await params;

    const [deleted] = await db
      .delete(megaMenuItems)
      .where(eq(megaMenuItems.id, itemId))
      .returning({ id: megaMenuItems.id });

    if (!deleted) return notFound("Item not found");

    const department = await getSectionDepartment(sectionId);
    if (department) {
      revalidateTag(CACHE_TAGS.megaMenu(department));
      revalidateTag(CACHE_TAGS.megaMenu("all"));
    }

    return noContent();
  } catch (e) {
    console.error("[mega-menu item DELETE]", e);
    return serverError();
  }
}
