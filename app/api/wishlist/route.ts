/**
 * GET    /api/wishlist     — Get user's wishlist product IDs
 * POST   /api/wishlist     — Add product to wishlist
 * DELETE /api/wishlist     — Remove product from wishlist (?productId=xxx)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { wishlists, wishlistItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ok,
  noContent,
  badRequest,
  requireAuth,
  isErrorResponse,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

async function getOrCreateWishlist(userId: string) {
  const [existing] = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(wishlists)
    .values({ id: generateId(), userId })
    .returning();
  return created;
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const wishlist = await getOrCreateWishlist(authResult.user.id);
    const items = await db
      .select({ productId: wishlistItems.productId })
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlist.id));

    return ok(items.map((i) => i.productId));
  } catch (e) {
    console.error("[wishlist GET]", e);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { productId } = (await request.json()) as { productId: string };
    if (!productId) return badRequest("productId is required");

    const wishlist = await getOrCreateWishlist(authResult.user.id);

    await db
      .insert(wishlistItems)
      .values({ id: generateId(), wishlistId: wishlist.id, productId })
      .onConflictDoNothing();

    return ok({ added: productId });
  } catch (e) {
    console.error("[wishlist POST]", e);
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) return badRequest("productId is required");

    const wishlist = await getOrCreateWishlist(authResult.user.id);

    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlist.id),
          eq(wishlistItems.productId, productId),
        ),
      );

    return noContent();
  } catch (e) {
    console.error("[wishlist DELETE]", e);
    return serverError();
  }
}
