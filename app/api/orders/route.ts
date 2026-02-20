/**
 * GET  /api/orders       — Get user's orders
 * POST /api/orders       — Create new order (checkout)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  cartItems,
  carts,
  productVariants,
  products,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ok,
  created,
  badRequest,
  requireAuth,
  isErrorResponse,
  generateId,
  generateOrderNumber,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const createOrderSchema = z.object({
  cartId: z.string().min(1),
  shippingName: z.string().min(1),
  shippingPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  shippingCountry: z.string().default("Kenya"),
  notes: z.string().optional(),
  isWhatsappOrder: z.boolean().default(false),
  guestEmail: z.string().email().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, authResult.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(50);

    return ok(userOrders);
  } catch (e) {
    console.error("[orders GET]", e);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    // Get session (optional — guest checkout allowed)
    const { getSession } = await import("@/lib/api/helpers");
    const session = await getSession();

    // Fetch cart items
    const items = await db
      .select({
        cartItemId: cartItems.id,
        quantity: cartItems.quantity,
        variantId: productVariants.id,
        size: productVariants.size,
        color: productVariants.color,
        price: productVariants.price,
        stock: productVariants.stock,
        sku: productVariants.sku,
        productName: products.name,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.cartId, parsed.data.cartId));

    if (items.length === 0) return badRequest("Cart is empty");

    // Validate stock
    for (const item of items) {
      if (item.stock < item.quantity) {
        return badRequest(
          `"${item.productName}" only has ${item.stock} in stock`,
        );
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
    const shippingCost = 0; // TODO: implement shipping calculator
    const total = subtotal + shippingCost;

    // Create order
    const orderId = generateId();
    const orderNumber = generateOrderNumber();

    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: session?.user.id ?? null,
      guestEmail: parsed.data.guestEmail,
      status: "pending",
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      total: total.toFixed(2),
      shippingName: parsed.data.shippingName,
      shippingPhone: parsed.data.shippingPhone,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      shippingCountry: parsed.data.shippingCountry,
      notes: parsed.data.notes,
      isWhatsappOrder: parsed.data.isWhatsappOrder,
    });

    // Create order items (snapshot of product/variant at purchase time)
    await db.insert(orderItems).values(
      items.map((item) => ({
        id: generateId(),
        orderId,
        variantId: item.variantId,
        productName: item.productName,
        variantSize: item.size,
        variantColor: item.color,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: (Number(item.price) * item.quantity).toFixed(2),
      })),
    );

    // Decrement stock
    await Promise.all(
      items.map((item) =>
        db
          .update(productVariants)
          .set({ stock: item.stock - item.quantity })
          .where(eq(productVariants.id, item.variantId)),
      ),
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, parsed.data.cartId));

    return created({ orderId, orderNumber, total });
  } catch (e) {
    console.error("[orders POST]", e);
    return serverError();
  }
}
