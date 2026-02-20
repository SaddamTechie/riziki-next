/**
 * Payment singleton — the ONE place that decides which provider to use.
 *
 * To swap payment providers:
 *   1. Import your provider class
 *   2. Replace `new DarajaProvider()` with `new YourProvider()`
 *   3. Done. Route Handlers and all callers are unaffected.
 */

import "server-only";
import { DarajaProvider } from "./providers/daraja";
import type { PaymentProvider } from "./types";

// ─── Swap provider here ───────────────────────────────────────────────────────
const payment: PaymentProvider = new DarajaProvider();
// ─────────────────────────────────────────────────────────────────────────────

export { payment };
export type {
  PaymentProvider,
  PaymentInitParams,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentStatus,
} from "./types";
