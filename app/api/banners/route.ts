/**
 * GET  /api/banners     — Get active banners for a department
 * POST /api/banners     — Create banner (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("dept");
    const type = searchParams.get("type");

    const now = new Date().toISOString();
    const conditions = [eq(banners.isActive, true)];
    if (department) {
      conditions.push(
        eq(
          banners.department,
          department as "men" | "women" | "beauty" | "all",
        ),
      );
    }
    if (type) {
      conditions.push(eq(banners.type, type as "hero" | "promo" | "strip"));
    }

    const rows = await db
      .select()
      .from(banners)
      .where(and(...conditions))
      .orderBy(asc(banners.sortOrder));

    // Filter by date range if set
    const active = rows.filter((b) => {
      if (b.startsAt && b.startsAt > now) return false;
      if (b.endsAt && b.endsAt < now) return false;
      return true;
    });

    return ok(active);
  } catch (e) {
    console.error("[banners GET]", e);
    return serverError();
  }
}

const createBannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  type: z.enum(["hero", "promo", "strip"]).default("hero"),
  imagePublicId: z.string().optional(),
  imageUrl: z.string().optional(),
  imageBlurDataUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  videoUrl: z.string().optional(),
  textTheme: z.enum(["light", "dark"]).default("light"),
  sortOrder: z.number().default(0),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createBannerSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const id = generateId();
    await db.insert(banners).values({ id, ...parsed.data });

    revalidateTag(CACHE_TAGS.banners);
    revalidateTag(CACHE_TAGS.bannersByDept(parsed.data.department));

    return created({ id });
  } catch (e) {
    console.error("[banners POST]", e);
    return serverError();
  }
}
