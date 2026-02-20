/**
 * GET  /api/cart        — Get current cart (user or guest via cookie)
 * POST /api/cart        — Add item to cart
 * DELETE /api/cart      — Clear cart
 */

import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  carts,
  cartItems,
  productVariants,
  products,
  productImages,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ok,
  created,
  noContent,
  badRequest,
  getSession,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const GUEST_CART_COOKIE = "riziki-guest-cart";

async function getOrCreateCart(
  userId: string | null,
  sessionId: string | null,
) {
  if (!userId && !sessionId) return null;

  const condition = userId
    ? eq(carts.userId, userId)
    : eq(carts.sessionId, sessionId!);

  const [existing] = await db.select().from(carts).where(condition).limit(1);

  if (existing) return existing;

  // Create new cart
  const id = generateId();
  const [cart] = await db
    .insert(carts)
    .values({ id, userId, sessionId })
    .returning();
  return cart;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const guestSessionId =
      request.cookies.get(GUEST_CART_COOKIE)?.value ?? null;

    const cart = await getOrCreateCart(
      session?.user.id ?? null,
      session ? null : guestSessionId,
    );

    if (!cart) return ok({ items: [], cartId: null });

    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        variantId: cartItems.variantId,
        size: productVariants.size,
        color: productVariants.color,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
        stock: productVariants.stock,
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        imageUrl: productImages.url,
        imagePublicId: productImages.publicId,
        imageBlurDataUrl: productImages.blurDataUrl,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true),
        ),
      )
      .where(eq(cartItems.cartId, cart.id));

    return ok({ items, cartId: cart.id });
  } catch (e) {
    console.error("[cart GET]", e);
    return serverError();
  }
}

const addItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    let guestSessionId = request.cookies.get(GUEST_CART_COOKIE)?.value ?? null;
    let isNewGuestSession = false;

    if (!session && !guestSessionId) {
      guestSessionId = generateId();
      isNewGuestSession = true;
    }

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const cart = await getOrCreateCart(
      session?.user.id ?? null,
      session ? null : guestSessionId,
    );
    if (!cart) return badRequest("Could not create cart");

    // Check if variant exists + has stock
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, parsed.data.variantId))
      .limit(1);

    if (!variant) return badRequest("Variant not found");
    if (variant.stock < parsed.data.quantity) {
      return badRequest("Not enough stock");
    }

    // Check if already in cart — increment if so
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.variantId, parsed.data.variantId),
        ),
      )
      .limit(1);

    if (existing) {
      const newQty = Math.min(
        existing.quantity + parsed.data.quantity,
        variant.stock,
      );
      await db
        .update(cartItems)
        .set({ quantity: newQty })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        id: generateId(),
        cartId: cart.id,
        variantId: parsed.data.variantId,
        quantity: parsed.data.quantity,
      });
    }

    const response = created({ cartId: cart.id });

    // Set guest session cookie if newly created
    if (isNewGuestSession && guestSessionId) {
      response.cookies.set(GUEST_CART_COOKIE, guestSessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (e) {
    console.error("[cart POST]", e);
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    const guestSessionId =
      request.cookies.get(GUEST_CART_COOKIE)?.value ?? null;

    const condition = session?.user.id
      ? eq(carts.userId, session.user.id)
      : guestSessionId
        ? eq(carts.sessionId, guestSessionId)
        : null;

    if (!condition) return noContent();

    const [cart] = await db.select().from(carts).where(condition).limit(1);
    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    return noContent();
  } catch (e) {
    console.error("[cart DELETE]", e);
    return serverError();
  }
}
