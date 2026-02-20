/**
 * Storage Provider Interface
 *
 * The app NEVER imports Cloudinary directly — it talks to this interface.
 * To swap to S3, R2, or any other provider:
 *   1. Create a new file in ./providers/
 *   2. Implement StorageProvider
 *   3. Change the ONE export in ./index.ts
 *
 * Nothing else in the app changes.
 */

export interface UploadResult {
  /** Provider-agnostic public ID (used in URLs) */
  publicId: string;
  /** Full CDN URL */
  url: string;
  /** Tiny base64-encoded blurred placeholder for next/image's blurDataURL */
  blurDataUrl: string;
  /** Natural width of the uploaded image */
  width: number;
  /** Natural height of the uploaded image */
  height: number;
  /** File format (jpg, webp, etc.) */
  format: string;
}

export interface StorageProvider {
  /**
   * Upload a file buffer or base64 string.
   * Returns a provider-agnostic UploadResult.
   */
  upload(file: Buffer | string, options?: UploadOptions): Promise<UploadResult>;

  /**
   * Delete a stored asset by its publicId.
   */
  delete(publicId: string): Promise<void>;

  /**
   * Generate a signed short-lived URL for direct client-side uploads.
   * The client uploads directly to the storage provider — no data passes
   * through your Next.js server.
   */
  signedUploadParams(options?: UploadOptions): Promise<SignedUploadParams>;
}

export interface UploadOptions {
  /** Logical folder / prefix within the storage bucket */
  folder?:
    | "products"
    | "banners"
    | "looks"
    | "categories"
    | "avatars"
    | "config";
  /** Override the auto-generated public ID */
  publicId?: string;
  /** Resource type (default: image) */
  resourceType?: "image" | "video" | "raw";
  /** Max width to resize to on upload (saves storage on originals) */
  maxWidth?: number;
}

export interface SignedUploadParams {
  /** Signed signature string */
  signature: string;
  /** Unix timestamp of when this signature expires */
  timestamp: number;
  /** Cloud/bucket name */
  cloudName: string;
  /** API key (public — safe to expose) */
  apiKey: string;
  /** Any extra fields to include in the upload form */
  extra: Record<string, string>;
}
