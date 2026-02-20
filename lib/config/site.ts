/**
 * Site configuration — typed defaults and a cached fetcher.
 *
 * The admin writes config values to the `site_config` DB table.
 * This module reads them, applies typed defaults (used when the DB has no value),
 * and caches the result indefinitely until `revalidateTag("site-config")` is called.
 *
 * Usage (server component or API route):
 *   import { getSiteConfig } from "@/lib/config/site"
 *   const config = await getSiteConfig()
 */

import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/db/schema";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/keys";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Department = "men" | "women" | "beauty";

export interface SiteConfig {
  /** Store display name */
  siteName: string;
  /** Tagline shown in header or homepage */
  siteTagline: string;
  /** Cloudinary public ID for the logo */
  logoPublicId: string | null;
  /** Blur placeholder for the logo */
  logoBlurDataUrl: string | null;
  /** Full logo URL */
  logoUrl: string | null;
  /** Which departments are active — controls the dept switcher visibility */
  activeDepartments: Department[];
  /** Primary brand color (hex) — used for accents */
  primaryColor: string;
  /** SEO meta description */
  seoDescription: string;
  /** WhatsApp number for Buy via WhatsApp */
  whatsappNumber: string | null;
  /** Currency code */
  currency: string;
  /** Currency symbol */
  currencySymbol: string;
  /** Shipping policy text shown on product pages */
  shippingPolicy: string | null;
  /** Returns policy text */
  returnsPolicy: string | null;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
// Used as fallback if the DB has not been seeded yet.

const DEFAULT_CONFIG: SiteConfig = {
  siteName: "Riziki",
  siteTagline: "Discover your style",
  logoPublicId: null,
  logoBlurDataUrl: null,
  logoUrl: null,
  activeDepartments: ["men", "women", "beauty"],
  primaryColor: "#000000",
  seoDescription: "Shop the latest fashion trends at Riziki.",
  whatsappNumber: null,
  currency: "KES",
  currencySymbol: "KSh",
  shippingPolicy: null,
  returnsPolicy: null,
};

// ─── Fetcher (cached) ─────────────────────────────────────────────────────────

async function fetchSiteConfig(): Promise<SiteConfig> {
  const rows = await db.select().from(siteConfig);

  const map = new Map(
    rows.map((r) => [r.key, { value: r.value, type: r.type }]),
  );

  function get<T>(key: string, fallback: T): T {
    const row = map.get(key);
    if (!row) return fallback;
    try {
      if (row.type === "json") return JSON.parse(row.value) as T;
      if (row.type === "boolean") return (row.value === "true") as unknown as T;
      if (row.type === "number") return Number(row.value) as unknown as T;
      return row.value as unknown as T;
    } catch {
      return fallback;
    }
  }

  return {
    siteName: get("site_name", DEFAULT_CONFIG.siteName),
    siteTagline: get("site_tagline", DEFAULT_CONFIG.siteTagline),
    logoPublicId: get("logo_public_id", DEFAULT_CONFIG.logoPublicId),
    logoBlurDataUrl: get("logo_blur_data_url", DEFAULT_CONFIG.logoBlurDataUrl),
    logoUrl: get("logo_url", DEFAULT_CONFIG.logoUrl),
    activeDepartments: get(
      "active_departments",
      DEFAULT_CONFIG.activeDepartments,
    ),
    primaryColor: get("primary_color", DEFAULT_CONFIG.primaryColor),
    seoDescription: get("seo_description", DEFAULT_CONFIG.seoDescription),
    whatsappNumber: get("whatsapp_number", DEFAULT_CONFIG.whatsappNumber),
    currency: get("currency", DEFAULT_CONFIG.currency),
    currencySymbol: get("currency_symbol", DEFAULT_CONFIG.currencySymbol),
    shippingPolicy: get("shipping_policy", DEFAULT_CONFIG.shippingPolicy),
    returnsPolicy: get("returns_policy", DEFAULT_CONFIG.returnsPolicy),
  };
}

/**
 * Cached site config fetcher.
 * Revalidate by calling: revalidateTag("site-config") in an admin action.
 */
export const getSiteConfig = unstable_cache(fetchSiteConfig, ["site-config"], {
  tags: [CACHE_TAGS.siteConfig],
  revalidate: CACHE_TTL.indefinite,
});
