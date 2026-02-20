/**
 * GET  /api/products           — List products (admin)
 * POST /api/products           — Create product (admin)
 */

import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
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

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("dept");
    const categoryId = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const offset = Number(searchParams.get("offset") ?? 0);

    const conditions = [eq(products.isActive, true)];
    if (department)
      conditions.push(
        inArray(products.department, [
          department as "men" | "women" | "beauty" | "all",
          "all",
        ]),
      );
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (featured) conditions.push(eq(products.isFeatured, true));

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        department: products.department,
        categoryId: products.categoryId,
        tags: products.tags,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return ok(rows);
  } catch (e) {
    console.error("[products GET]", e);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const id = generateId();
    await db.insert(products).values({ id, ...parsed.data });

    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.productsByDept(parsed.data.department));
    if (parsed.data.isFeatured) revalidateTag(CACHE_TAGS.featuredProducts);

    return created({ id });
  } catch (e) {
    console.error("[products POST]", e);
    return serverError();
  }
}
