/**
 * GET  /api/looks/:id/items  — List items (with product details) for a look
 * POST /api/looks/:id/items  — Add a single product to a look (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { looks, lookItems, products, productImages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
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

/** Re-compute and persist totalPrice for a look from its current items. */
async function recalculateTotalPrice(lookId: string) {
  const rows = await db
    .select({ price: products.price })
    .from(lookItems)
    .innerJoin(products, eq(lookItems.productId, products.id))
    .where(eq(lookItems.lookId, lookId));

  const total = rows.reduce((sum, r) => sum + parseFloat(r.price ?? "0"), 0);
  await db
    .update(looks)
    .set({ totalPrice: total.toFixed(2) })
    .where(eq(looks.id, lookId));
  return total;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const rows = await db
      .select({
        id: lookItems.id,
        lookId: lookItems.lookId,
        sortOrder: lookItems.sortOrder,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        price: products.price,
        imagePublicId: productImages.publicId,
      })
      .from(lookItems)
      .innerJoin(products, eq(lookItems.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true),
        ),
      )
      .where(eq(lookItems.lookId, id))
      .orderBy(asc(lookItems.sortOrder));

    return ok(rows);
  } catch (e) {
    console.error("[look items GET]", e);
    return serverError();
  }
}

const addItemSchema = z.object({
  productId: z.string().min(1),
  sortOrder: z.number().int().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id } = await params;

    const [look] = await db
      .select({ id: looks.id, department: looks.department })
      .from(looks)
      .where(eq(looks.id, id))
      .limit(1);
    if (!look) return notFound("Look not found");

    // Enforce max 6 items
    const existing = await db
      .select({ id: lookItems.id })
      .from(lookItems)
      .where(eq(lookItems.lookId, id));
    if (existing.length >= 6)
      return badRequest("A look can have at most 6 products");

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success)
      return badRequest(JSON.stringify(parsed.error.flatten().fieldErrors));

    const { productId, sortOrder } = parsed.data;
    const itemId = generateId();

    await db.insert(lookItems).values({
      id: itemId,
      lookId: id,
      productId,
      sortOrder: sortOrder ?? existing.length,
    });

    await recalculateTotalPrice(id);
    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(look.department));

    return created({ id: itemId });
  } catch (e) {
    console.error("[look items POST]", e);
    return serverError();
  }
}
