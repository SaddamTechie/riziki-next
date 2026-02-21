/**
 * GET    /api/banners/:id  — Get a single banner (admin)
 * PATCH  /api/banners/:id  — Update a banner (admin)
 * DELETE /api/banners/:id  — Delete a banner (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
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
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const updateBannerSchema = z
  .object({
    title: z.string(),
    subtitle: z.string(),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    department: z.enum(["men", "women", "beauty", "all"]),
    type: z.enum(["hero", "promo", "strip"]),
    imagePublicId: z.string(),
    imageUrl: z.string(),
    imageBlurDataUrl: z.string(),
    videoPublicId: z.string(),
    videoUrl: z.string(),
    textTheme: z.enum(["light", "dark"]),
    sortOrder: z.number(),
    isActive: z.boolean(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
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
    const [banner] = await db
      .select()
      .from(banners)
      .where(eq(banners.id, id))
      .limit(1);

    if (!banner) return notFound("Banner not found");

    return ok(banner);
  } catch (e) {
    console.error("[banner GET]", e);
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
    const parsed = updateBannerSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(banners)
      .set(parsed.data)
      .where(eq(banners.id, id))
      .returning({ id: banners.id, department: banners.department });

    if (!updated) return notFound("Banner not found");

    revalidateTag(CACHE_TAGS.banners);
    revalidateTag(CACHE_TAGS.bannersByDept(updated.department));

    return ok({ id: updated.id });
  } catch (e) {
    console.error("[banner PATCH]", e);
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
    const [deleted] = await db
      .delete(banners)
      .where(eq(banners.id, id))
      .returning({
        id: banners.id,
        department: banners.department,
        imagePublicId: banners.imagePublicId,
        videoPublicId: banners.videoPublicId,
      });

    if (!deleted) return notFound("Banner not found");

    // Delete media assets from Cloudinary (fire-and-forget)
    const cleanups = [
      deleted.imagePublicId && storage.delete(deleted.imagePublicId),
      deleted.videoPublicId && storage.delete(deleted.videoPublicId),
    ].filter(Boolean) as Promise<void>[];

    if (cleanups.length > 0) {
      Promise.all(cleanups).catch((err) => {
        console.error("[banner DELETE] cloudinary cleanup failed:", err);
      });
    }

    revalidateTag(CACHE_TAGS.banners);
    revalidateTag(CACHE_TAGS.bannersByDept(deleted.department));

    return noContent();
  } catch (e) {
    console.error("[banner DELETE]", e);
    return serverError();
  }
}
