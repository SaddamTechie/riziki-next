/**
 * GET    /api/mega-menu/:sectionId  — Get a single section with items (admin)
 * PATCH  /api/mega-menu/:sectionId  — Update a section (admin)
 * DELETE /api/mega-menu/:sectionId  — Delete a section + all its items (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { megaMenuSections, megaMenuItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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

const updateSectionSchema = z
  .object({
    label: z.string().min(1),
    sortOrder: z.number(),
    isActive: z.boolean(),
  })
  .partial();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId } = await params;

    const [section] = await db
      .select()
      .from(megaMenuSections)
      .where(eq(megaMenuSections.id, sectionId))
      .limit(1);

    if (!section) return notFound("Section not found");

    const items = await db
      .select()
      .from(megaMenuItems)
      .where(eq(megaMenuItems.sectionId, sectionId))
      .orderBy(asc(megaMenuItems.sortOrder));

    return ok({ ...section, items });
  } catch (e) {
    console.error("[mega-menu section GET]", e);
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId } = await params;
    const body = await request.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(megaMenuSections)
      .set(parsed.data)
      .where(eq(megaMenuSections.id, sectionId))
      .returning({
        id: megaMenuSections.id,
        department: megaMenuSections.department,
      });

    if (!updated) return notFound("Section not found");

    revalidateTag(CACHE_TAGS.megaMenu(updated.department));
    revalidateTag(CACHE_TAGS.megaMenu("all"));

    return ok({ id: updated.id });
  } catch (e) {
    console.error("[mega-menu section PATCH]", e);
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId } = await params;

    // Items cascade-delete via FK, but we need the department for cache invalidation
    const [deleted] = await db
      .delete(megaMenuSections)
      .where(eq(megaMenuSections.id, sectionId))
      .returning({
        id: megaMenuSections.id,
        department: megaMenuSections.department,
      });

    if (!deleted) return notFound("Section not found");

    revalidateTag(CACHE_TAGS.megaMenu(deleted.department));
    revalidateTag(CACHE_TAGS.megaMenu("all"));

    return noContent();
  } catch (e) {
    console.error("[mega-menu section DELETE]", e);
    return serverError();
  }
}
