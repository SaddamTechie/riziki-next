/**
 * PUT    /api/cart/[itemId]    — Update quantity
 * DELETE /api/cart/[itemId]    — Remove item
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  ok,
  noContent,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const updateSchema = z.object({
  quantity: z.number().int().positive(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const [updated] = await db
      .update(cartItems)
      .set({ quantity: parsed.data.quantity })
      .where(eq(cartItems.id, itemId))
      .returning();

    if (!updated) return notFound("Cart item not found");
    return ok(updated);
  } catch (e) {
    console.error("[cart item PUT]", e);
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return noContent();
  } catch (e) {
    console.error("[cart item DELETE]", e);
    return serverError();
  }
}
