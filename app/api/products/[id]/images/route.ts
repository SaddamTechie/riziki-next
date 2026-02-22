/**
 * GET  /api/products/:id/images  — List images for a product
 * POST /api/products/:id/images  — Add an image (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productImages, products } from "@/lib/db/schema";
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

const addImageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().min(1),
  blurDataUrl: z.string().optional().nullable(),
  alt: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder));
    return ok(rows);
  } catch (e) {
    console.error("[images GET]", e);
    return serverError();
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;

    const [product] = await db
      .select({
        id: products.id,
        slug: products.slug,
        department: products.department,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!product) return notFound("Product not found");

    const body = await request.json();
    const parsed = addImageSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const imageId = generateId();
    await db.insert(productImages).values({
      id: imageId,
      productId: id,
      ...parsed.data,
    });

    revalidateTag(CACHE_TAGS.product(product.slug));
    revalidateTag(CACHE_TAGS.productsByDept(product.department));

    return created({ id: imageId });
  } catch (e) {
    console.error("[images POST]", e);
    return serverError();
  }
}
