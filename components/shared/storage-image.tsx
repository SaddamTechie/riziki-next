/**
 * StorageImage — abstracted image component.
 *
 * The app ONLY uses this component, never next/image directly.
 * It handles:
 *   - Blur-up placeholder (blurDataURL stored at upload time)
 *   - Correct loader (via next.config.ts loaderFile)
 *   - Lazy loading by default
 *   - Priority loading for above-the-fold images
 *
 * To swap storage providers, only change lib/storage/image-loader.ts.
 * This component never needs updating.
 */

import Image, { type ImageProps } from "next/image";

interface StorageImageProps extends Omit<ImageProps, "src"> {
  /** Cloudinary public ID (e.g. "riziki/products/abc123") or a full URL. Null/empty renders nothing. */
  src: string | null | undefined;
  /** Blur placeholder base64 string stored at upload time */
  blurDataUrl?: string;
}

export function StorageImage({
  src,
  blurDataUrl,
  alt,
  ...props
}: StorageImageProps) {
  // Guard: empty or missing src would cause Next.js to re-fetch the page.
  // Render nothing (the parent is responsible for sizing via fill/width/height).
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      placeholder={blurDataUrl ? "blur" : "empty"}
      blurDataURL={blurDataUrl}
      {...props}
    />
  );
}
