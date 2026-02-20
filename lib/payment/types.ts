/**
 * Payment Provider Interface
 *
 * The app never calls a payment SDK directly — it talks to this interface.
 * To integrate a provider:
 *   1. Create a new file in ./providers/
 *   2. Implement PaymentProvider
 *   3. Change the ONE export in lib/payment/index.ts
 *
 * The three Route Handlers (initialize, verify, webhook) are already wired
 * to call these methods — no changes needed there when swapping providers.
 */

export interface PaymentInitParams {
  /** Unique order reference from your DB */
  orderRef: string;
  /** Amount in the smallest currency unit (e.g. KES cents) */
  amount: number;
  /** Customer phone number (international format, e.g. 254712345678) */
  phone: string;
  /** Customer email */
  email: string;
  /** Customer name */
  name: string;
  /** Your callback URL for this payment */
  callbackUrl: string;
}

export interface PaymentInitResult {
  /** Provider-specific payment reference/transaction ID */
  paymentRef: string;
  /** If the provider redirects the user, include the URL here */
  redirectUrl?: string;
  /** Human-readable status message */
  message: string;
}

export type PaymentStatus = "success" | "failed" | "pending";

export interface PaymentVerifyResult {
  status: PaymentStatus;
  /** Amount actually paid */
  amountPaid?: number;
  /** Provider transaction ID */
  transactionId?: string;
  /** Raw provider response (for logging) */
  raw?: unknown;
}

export interface PaymentProvider {
  /** Initiate a payment (e.g. STK push, redirect, etc.) */
  initialize(params: PaymentInitParams): Promise<PaymentInitResult>;

  /** Verify a payment by its reference */
  verify(paymentRef: string): Promise<PaymentVerifyResult>;

  /**
   * Handle an inbound webhook from the provider.
   * Should verify the signature and return the status.
   * @param payload - Raw request body (string or object)
   * @param signature - Provider-specific signature header value
   */
  handleWebhook(
    payload: unknown,
    signature: string,
  ): Promise<{ orderRef: string; status: PaymentStatus }>;
}
