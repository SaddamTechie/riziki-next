/**
 * Cloudinary Storage Provider
 *
 * Free-tier only operations:
 *   - Upload (with auto-format, auto-quality, max-width resize)
 *   - Delete
 *   - Signed upload params for direct client uploads
 *   - URL transformations via Cloudinary's free URL API
 *   - Blur placeholder generation (tiny 10px thumbnail, base64)
 *
 * NO paid AI features are used.
 */

import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import type {
  StorageProvider,
  UploadResult,
  UploadOptions,
  SignedUploadParams,
} from "../types";

// Configure Cloudinary once at module level (server-only)
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export class CloudinaryProvider implements StorageProvider {
  async upload(
    file: Buffer | string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const {
      folder = "products",
      publicId,
      resourceType = "image",
      maxWidth = 2000,
    } = options;

    const uploadSource =
      file instanceof Buffer
        ? `data:image/jpeg;base64,${file.toString("base64")}`
        : file;

    const result = await cloudinary.uploader.upload(uploadSource as string, {
      folder: `riziki/${folder}`,
      public_id: publicId,
      resource_type: resourceType,
      // Free-tier transformations applied at upload time
      transformation:
        resourceType === "image"
          ? [
              { width: maxWidth, crop: "limit" }, // never upscale
              { fetch_format: "auto", quality: "auto" }, // auto WebP/AVIF
            ]
          : undefined,
      overwrite: !!publicId,
    });

    // Generate blur placeholder: tiny 10px wide thumbnail → base64
    const blurDataUrl = await this.#generateBlurPlaceholder(result.public_id);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      blurDataUrl,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async signedUploadParams(
    options: UploadOptions = {},
  ): Promise<SignedUploadParams> {
    const { folder = "products" } = options;
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: `riziki/${folder}`,
      // Apply same free-tier transformations
      transformation: "c_limit,w_2000/f_auto,q_auto",
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return {
      signature,
      timestamp,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      extra: {
        folder: `riziki/${folder}`,
        transformation: "c_limit,w_2000/f_auto,q_auto",
      },
    };
  }

  /**
   * Generate a tiny 10px blurred base64 thumbnail for next/image's blurDataURL.
   * Uses Cloudinary's free URL transformation API — no upload, just URL generation.
   */
  async #generateBlurPlaceholder(publicId: string): Promise<string> {
    try {
      const tinyUrl = cloudinary.url(publicId, {
        width: 10,
        aspect_ratio: "1.0",
        crop: "fill",
        fetch_format: "auto",
        quality: 1,
        effect: "blur:1000",
        secure: true,
      });

      const response = await fetch(tinyUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = response.headers.get("content-type") ?? "image/jpeg";
      return `data:${mimeType};base64,${base64}`;
    } catch {
      // Return a generic grey placeholder if fetch fails
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=";
    }
  }
}
