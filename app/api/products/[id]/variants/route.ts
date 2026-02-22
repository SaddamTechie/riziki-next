/**
 * GET  /api/products/:id/variants  — List variants for a product
 * POST /api/products/:id/variants  — Add a variant (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productVariants, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

const createVariantSchema = z.object({
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().min(1), // decimal string e.g. "1500.00"
  compareAtPrice: z.string().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));
    return ok(rows);
  } catch (e) {
    console.error("[variants GET]", e);
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

    // Ensure product exists
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
    const parsed = createVariantSchema.safeParse(body);
    if (!parsed.success)
      return badRequest(
        parsed.error.flatten().fieldErrors as unknown as string,
      );

    const variantId = generateId();
    await db.insert(productVariants).values({
      id: variantId,
      productId: id,
      ...parsed.data,
    });

    revalidateTag(CACHE_TAGS.product(product.slug));
    revalidateTag(CACHE_TAGS.productsByDept(product.department));

    return created({ id: variantId });
  } catch (e) {
    console.error("[variants POST]", e);
    return serverError();
  }
}
