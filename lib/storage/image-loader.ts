/**
 * Custom Next.js image loader for the storage abstraction.
 *
 * This file is referenced in next.config.ts `images.loaderFile`.
 * It runs on the CLIENT and transforms a stored `src` (Cloudinary public ID
 * or a full URL) into a properly sized, format-optimized URL.
 *
 * By keeping all URL-building logic here, the rest of the app never
 * constructs Cloudinary URLs manually — swap providers by updating this file.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function storageImageLoader({
  src,
  width,
  quality = 75,
}: LoaderParams): string {
  // If src is already a full URL (e.g. placehold.co or other external images),
  // return it as-is with no transformation.
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (!CLOUD_NAME) {
    console.warn("[StorageImage] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
    return src;
  }

  // Build a Cloudinary URL with free-tier transformations:
  // - Resize to requested width
  // - Auto format (WebP/AVIF based on browser)
  // - Auto quality
  const transformations = `f_auto,q_${quality},w_${width},c_limit`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${src}`;
}
