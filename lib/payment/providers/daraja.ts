/**
 * Daraja (M-Pesa / Safaricom) Payment Provider
 *
 * STK Push flow:
 *   1. POST /api/payments/initialize → calls initialize() → sends STK push to phone
 *   2. User approves on phone
 *   3. Daraja POSTs to PAYMENT_CALLBACK_URL → webhook handler processes it
 *   4. Alternatively, POST /api/payments/verify → calls verify() → polls Daraja
 *
 * To activate:
 *   1. Register at https://developer.safaricom.co.ke/
 *   2. Create an app → get Consumer Key & Secret
 *   3. Fill in PAYMENT_* env vars in .env.local
 *   4. Set PAYMENT_CALLBACK_URL to a publicly accessible URL (use ngrok for dev)
 */

import "server-only";
import type {
  PaymentProvider,
  PaymentInitParams,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentStatus,
} from "../types";
import { env } from "@/lib/env";

const DARAJA_BASE_URL =
  env.NODE_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${env.PAYMENT_CONSUMER_KEY}:${env.PAYMENT_CONSUMER_SECRET}`,
  ).toString("base64");

  const res = await fetch(
    `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      // Short cache — token expires in 1 hour
      next: { revalidate: 3500 },
    },
  );

  if (!res.ok) throw new Error("Daraja: failed to get access token");
  const data = await res.json();
  return data.access_token as string;
}

function generatePassword(timestamp: string): string {
  const shortcode = env.PAYMENT_SHORTCODE ?? "";
  const passkey = env.PAYMENT_PASSKEY ?? "";
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function formatTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

export class DarajaProvider implements PaymentProvider {
  async initialize(params: PaymentInitParams): Promise<PaymentInitResult> {
    const accessToken = await getAccessToken();
    const timestamp = formatTimestamp();
    const password = generatePassword(timestamp);

    const body = {
      BusinessShortCode: env.PAYMENT_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(params.amount / 100), // Convert from cents to KES
      PartyA: params.phone,
      PartyB: env.PAYMENT_SHORTCODE,
      PhoneNumber: params.phone,
      CallBackURL: params.callbackUrl,
      AccountReference: params.orderRef,
      TransactionDesc: `Order ${params.orderRef}`,
    };

    const res = await fetch(
      `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (!res.ok || data.ResponseCode !== "0") {
      throw new Error(
        `Daraja STK push failed: ${data.errorMessage ?? data.ResponseDescription}`,
      );
    }

    return {
      paymentRef: data.CheckoutRequestID,
      message: data.CustomerMessage ?? "STK push sent. Check your phone.",
    };
  }

  async verify(paymentRef: string): Promise<PaymentVerifyResult> {
    const accessToken = await getAccessToken();
    const timestamp = formatTimestamp();
    const password = generatePassword(timestamp);

    const res = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: env.PAYMENT_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: paymentRef,
      }),
    });

    const data = await res.json();

    let status: PaymentStatus = "pending";
    if (data.ResultCode === "0") status = "success";
    else if (data.ResultCode !== undefined && data.ResultCode !== "0") {
      status = "failed";
    }

    return { status, raw: data };
  }

  async handleWebhook(
    payload: unknown,
  ): Promise<{ orderRef: string; status: PaymentStatus }> {
    // Daraja sends the webhook as JSON
    const body = payload as {
      Body: {
        stkCallback: {
          CheckoutRequestID: string;
          ResultCode: number;
          ResultDesc: string;
          CallbackMetadata?: {
            Item: Array<{ Name: string; Value?: string | number }>;
          };
        };
      };
    };

    const callback = body.Body.stkCallback;
    const orderRef =
      callback.CallbackMetadata?.Item?.find(
        (i) => i.Name === "AccountReference",
      )?.Value?.toString() ?? callback.CheckoutRequestID;

    const status: PaymentStatus =
      callback.ResultCode === 0 ? "success" : "failed";

    return { orderRef, status };
  }
}
