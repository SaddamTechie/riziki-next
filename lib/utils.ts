import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price amount with currency symbol.
 * @param amount  Amount in minor units (e.g. cents / subunits) OR whole units.
 *                Pass `minor: true` when the amount is in subunits.
 */
export function formatPrice(
  amount: number,
  currency: string = "KES",
  options: { minor?: boolean } = {},
): string {
  const value = options.minor ? amount / 100 : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Truncate a string to a maximum length, appending "…" if cut. */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Build a Cloudinary 1200×630 Open-Graph image URL from a public ID.
 *  Forces f_jpg — WhatsApp's link-preview crawler rejects WebP (f_auto).
 *  If publicId is already an absolute URL (e.g. a placeholder/external image),
 *  it is returned as-is to avoid wrapping it inside a Cloudinary transform. */
export function getOgImageUrl(publicId: string, cloudName: string): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill,f_jpg,q_auto/${publicId}`;
}
