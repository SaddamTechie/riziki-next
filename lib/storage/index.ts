/**
 * Storage singleton — the ONE place that decides which provider to use.
 *
 * To swap providers:
 *   1. Import your new provider class
 *   2. Replace `new CloudinaryProvider()` with `new YourProvider()`
 *   3. Done. Nothing else in the app changes.
 */

import "server-only";
import { CloudinaryProvider } from "./providers/cloudinary";
import type { StorageProvider } from "./types";

// ─── Swap provider here ───────────────────────────────────────────────────────
const storage: StorageProvider = new CloudinaryProvider();
// ─────────────────────────────────────────────────────────────────────────────

export { storage };
export type {
  StorageProvider,
  UploadResult,
  UploadOptions,
  SignedUploadParams,
} from "./types";
