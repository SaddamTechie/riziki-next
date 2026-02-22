/**
 * PATCH  /api/products/:id/variants/:variantId  — Update a variant (admin)
 * DELETE /api/products/:id/variants/:variantId  — Delete a variant (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productVariants, products } from "@/lib/db/schema";
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

const updateVariantSchema = z
  .object({
    size: z.string().min(1),
    color: z.string().min(1),
    colorHex: z.string().nullable(),
    sku: z.string().nullable(),
    price: z.string().min(1),
    compareAtPrice: z.string().nullable(),
    stock: z.number().int().min(0),
    isActive: z.boolean(),
  })
  .partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id, variantId } = await params;
    const body = await request.json();
    const parsed = updateVariantSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(productVariants)
      .set(parsed.data)
      .where(eq(productVariants.id, variantId))
      .returning({ id: productVariants.id });

    if (!updated) return notFound("Variant not found");

    // Revalidate product cache
    const [product] = await db
      .select({ slug: products.slug, department: products.department })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (product) {
      revalidateTag(CACHE_TAGS.product(product.slug));
      revalidateTag(CACHE_TAGS.productsByDept(product.department));
    }

    return ok({ id: updated.id });
  } catch (e) {
    console.error("[variant PATCH]", e);
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id, variantId } = await params;

    const [deleted] = await db
      .delete(productVariants)
      .where(eq(productVariants.id, variantId))
      .returning({ id: productVariants.id });

    if (!deleted) return notFound("Variant not found");

    const [product] = await db
      .select({ slug: products.slug, department: products.department })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (product) {
      revalidateTag(CACHE_TAGS.product(product.slug));
      revalidateTag(CACHE_TAGS.productsByDept(product.department));
    }

    return noContent();
  } catch (e) {
    console.error("[variant DELETE]", e);
    return serverError();
  }
}
