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

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  tags: z.array(z.string()).default([]),
  price: z.string().default("0"), // display price e.g. "1500.00"
  compareAtPrice: z.string().optional().nullable(),
  brand: z.string().optional(),
  isNew: z.boolean().default(false),
  isSale: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("dept");
    const categoryId = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const showAll = searchParams.get("all") === "true"; // admin: include inactive
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const offset = Number(searchParams.get("offset") ?? 0);

    const conditions = showAll ? [] : [eq(products.isActive, true)];
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
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        brand: products.brand,
        isNew: products.isNew,
        isSale: products.isSale,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        // Primary image (null if no images added yet)
        imagePublicId: productImages.publicId,
        imageUrl: productImages.url,
        imageBlurDataUrl: productImages.blurDataUrl,
      })
      .from(products)
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true),
        ),
      )
      .where(conditions.length ? and(...conditions) : undefined)
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
    const slug = parsed.data.slug ?? toSlug(parsed.data.name);
    await db.insert(products).values({ id, ...parsed.data, slug });

    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.productsByDept(parsed.data.department));
    if (parsed.data.isFeatured) revalidateTag(CACHE_TAGS.featuredProducts);

    return created({ id, slug });
  } catch (e) {
    console.error("[products POST]", e);
    return serverError();
  }
}
