/**
 * GET    /api/products/[id]   — Get full product with variants + images
 * PUT    /api/products/[id]   — Update product (admin)
 * DELETE /api/products/[id]   — Delete product (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/db/schema";
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

const updateProductSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string(),
    categoryId: z.string().min(1),
    department: z.enum(["men", "women", "beauty", "all"]),
    tags: z.array(z.string()),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
  })
  .partial();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) return notFound("Product not found");

    const [images, variants] = await Promise.all([
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(productImages.sortOrder),
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id)),
    ]);

    return ok({ ...product, images, variants });
  } catch (e) {
    console.error("[product GET]", e);
    return serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id))
      .returning({ slug: products.slug, department: products.department });

    if (!updated) return notFound("Product not found");

    revalidateTag(CACHE_TAGS.product(updated.slug));
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.productsByDept(updated.department));
    revalidateTag(CACHE_TAGS.featuredProducts);

    return ok({ id });
  } catch (e) {
    console.error("[product PUT]", e);
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
      .delete(products)
      .where(eq(products.id, id))
      .returning({ slug: products.slug, department: products.department });

    if (!deleted) return notFound("Product not found");

    revalidateTag(CACHE_TAGS.product(deleted.slug));
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.productsByDept(deleted.department));

    return noContent();
  } catch (e) {
    console.error("[product DELETE]", e);
    return serverError();
  }
}
