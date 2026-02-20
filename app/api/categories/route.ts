/**
 * GET  /api/categories    — List categories (supports ?dept= filter)
 * POST /api/categories    — Create category (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, and, isNull, asc } from "drizzle-orm";
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

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imagePublicId: z.string().optional(),
  imageBlurDataUrl: z.string().optional(),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get("dept");
    const parentId = searchParams.get("parentId");

    const conditions = [eq(categories.isActive, true)];
    if (dept)
      conditions.push(
        eq(categories.department, dept as "men" | "women" | "beauty" | "all"),
      );
    if (parentId === "null") conditions.push(isNull(categories.parentId));
    else if (parentId) conditions.push(eq(categories.parentId, parentId));

    const rows = await db
      .select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(asc(categories.sortOrder));

    return ok(rows);
  } catch (e) {
    console.error("[categories GET]", e);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const id = generateId();
    await db.insert(categories).values({ id, ...parsed.data });

    revalidateTag(CACHE_TAGS.categories);
    if (parsed.data.department) {
      revalidateTag(CACHE_TAGS.categoriesByDept(parsed.data.department));
    }

    return created({ id });
  } catch (e) {
    console.error("[categories POST]", e);
    return serverError();
  }
}
