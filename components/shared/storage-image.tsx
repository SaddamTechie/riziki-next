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
  /** Cloudinary public ID (e.g. "riziki/products/abc123") or a full URL */
  src: string;
  /** Blur placeholder base64 string stored at upload time */
  blurDataUrl?: string;
}

export function StorageImage({
  src,
  blurDataUrl,
  alt,
  ...props
}: StorageImageProps) {
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
