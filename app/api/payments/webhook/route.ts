/**
 * POST /api/payments/webhook — Receive payment provider callbacks
 *
 * For Daraja (M-Pesa), Safaricom POSTs to this endpoint after payment.
 * The URL is set in PAYMENT_CALLBACK_URL env var.
 */

import { type NextRequest } from "next/server";
import { payment } from "@/lib/payment";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ok, serverError } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature =
      request.headers.get("x-signature") ??
      request.headers.get("authorization") ??
      "";

    const { orderRef, status } = await payment.handleWebhook(
      payload,
      signature,
    );

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderRef))
      .limit(1);

    if (order) {
      await db
        .update(orders)
        .set({
          status: status === "success" ? "confirmed" : "cancelled",
          paidAt: status === "success" ? new Date() : null,
        })
        .where(eq(orders.id, order.id));
    }

    // Always return 200 to the provider — never reveal internal errors
    return ok({ received: true });
  } catch (e) {
    console.error("[payment webhook]", e);
    // Still return 200 to prevent webhook retries flooding us
    return ok({ received: true });
  }
}
