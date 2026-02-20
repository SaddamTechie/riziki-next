/**
 * GET  /api/mega-menu     — Get full mega menu for a department
 * POST /api/mega-menu     — Create section (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { megaMenuSections, megaMenuItems } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/keys";
import {
  ok,
  created,
  badRequest,
  requireAdmin,
  isErrorResponse,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

async function fetchMegaMenu(department: string) {
  const sections = await db
    .select()
    .from(megaMenuSections)
    .where(
      and(
        eq(megaMenuSections.isActive, true),
        eq(
          megaMenuSections.department,
          department as "men" | "women" | "beauty" | "all",
        ),
      ),
    )
    .orderBy(asc(megaMenuSections.sortOrder));

  const sectionsWithItems = await Promise.all(
    sections.map(async (section) => {
      const items = await db
        .select()
        .from(megaMenuItems)
        .where(
          and(
            eq(megaMenuItems.sectionId, section.id),
            eq(megaMenuItems.isActive, true),
          ),
        )
        .orderBy(asc(megaMenuItems.sortOrder));
      return { ...section, items };
    }),
  );

  return sectionsWithItems;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("dept") ?? "all";

    const getCachedMenu = unstable_cache(
      () => fetchMegaMenu(department),
      [`mega-menu-${department}`],
      {
        tags: [CACHE_TAGS.megaMenu(department)],
        revalidate: CACHE_TTL.indefinite,
      },
    );

    const menu = await getCachedMenu();
    return ok(menu);
  } catch (e) {
    console.error("[mega-menu GET]", e);
    return serverError();
  }
}

const createSectionSchema = z.object({
  department: z.enum(["men", "women", "beauty", "all"]),
  label: z.string().min(1),
  sortOrder: z.number().default(0),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const id = generateId();
    await db.insert(megaMenuSections).values({ id, ...parsed.data });

    revalidateTag(CACHE_TAGS.megaMenu(parsed.data.department));

    return created({ id });
  } catch (e) {
    console.error("[mega-menu POST]", e);
    return serverError();
  }
}
