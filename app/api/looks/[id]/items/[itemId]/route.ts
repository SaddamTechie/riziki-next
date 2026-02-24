/**
 * DELETE /api/looks/:id/items/:itemId  — Remove a single product from a look (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { looks, lookItems, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  notFound,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";

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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id, itemId } = await params;

    const [look] = await db
      .select({ id: looks.id, department: looks.department })
      .from(looks)
      .where(eq(looks.id, id))
      .limit(1);
    if (!look) return notFound("Look not found");

    const [deleted] = await db
      .delete(lookItems)
      .where(eq(lookItems.id, itemId))
      .returning({ id: lookItems.id });

    if (!deleted) return notFound("Item not found");

    await recalculateTotalPrice(id);
    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(look.department));

    return ok({ id: deleted.id });
  } catch (e) {
    console.error("[look item DELETE]", e);
    return serverError();
  }
}
