/**
 * POST /api/payments/initialize    — Start a payment
 * GET  /api/payments/verify        — Verify a payment status
 */

import { type NextRequest } from "next/server";
import { payment } from "@/lib/payment";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, badRequest, notFound, serverError } from "@/lib/api/helpers";
import { z } from "zod";
import { env } from "@/lib/env";

const initSchema = z.object({
  orderId: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = initSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    // Fetch order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parsed.data.orderId))
      .limit(1);

    if (!order) return notFound("Order not found");
    if (order.status !== "pending") {
      return badRequest("Order is not in a payable state");
    }

    const result = await payment.initialize({
      orderRef: order.orderNumber,
      amount: Math.round(Number(order.total) * 100), // to cents
      phone: parsed.data.phone,
      email: parsed.data.email,
      name: parsed.data.name,
      callbackUrl:
        env.PAYMENT_CALLBACK_URL ??
        `${env.BETTER_AUTH_URL}/api/payments/webhook`,
    });

    // Update order with payment reference
    await db
      .update(orders)
      .set({
        status: "payment_pending",
        paymentRef: result.paymentRef,
        paymentProvider: "daraja", // update when swapping provider
      })
      .where(eq(orders.id, parsed.data.orderId));

    return ok(result);
  } catch (e) {
    console.error("[payment initialize]", e);
    return serverError();
  }
}
