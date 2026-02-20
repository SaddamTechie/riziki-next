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

/** Build a Cloudinary 1200×630 Open-Graph image URL from a public ID. */
export function getOgImageUrl(publicId: string, cloudName: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/${publicId}`;
}
