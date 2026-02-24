/**
 * GET   /api/mega-menu/:sectionId/items  — List items for a section (admin)
 * POST  /api/mega-menu/:sectionId/items  — Create an item (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { megaMenuSections, megaMenuItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  created,
  badRequest,
  notFound,
  requireAdmin,
  isErrorResponse,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const createItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  imagePublicId: z.string().nullish(),
  imageUrl: z.string().nullish(),
  imageBlurDataUrl: z.string().nullish(),
  badge: z.string().nullish(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId } = await params;

    const items = await db
      .select()
      .from(megaMenuItems)
      .where(eq(megaMenuItems.sectionId, sectionId))
      .orderBy(asc(megaMenuItems.sortOrder));

    return ok(items);
  } catch (e) {
    console.error("[mega-menu items GET]", e);
    return serverError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { sectionId } = await params;

    // Verify section exists and get department for cache invalidation
    const [section] = await db
      .select({ department: megaMenuSections.department })
      .from(megaMenuSections)
      .where(eq(megaMenuSections.id, sectionId))
      .limit(1);

    if (!section) return notFound("Section not found");

    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success)
      return badRequest(JSON.stringify(parsed.error.flatten()));

    const id = generateId();
    await db.insert(megaMenuItems).values({ id, sectionId, ...parsed.data });

    revalidateTag(CACHE_TAGS.megaMenu(section.department));
    revalidateTag(CACHE_TAGS.megaMenu("all"));

    return created({ id });
  } catch (e) {
    console.error("[mega-menu items POST]", e);
    return serverError();
  }
}
