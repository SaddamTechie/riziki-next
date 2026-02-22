/**
 * GET /api/config     — Get site config (public)
 * PUT /api/config     — Update site config (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/db/schema";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";

export async function GET() {
  try {
    // Query DB directly — bypass unstable_cache (which is for server components).
    // External API consumers (e.g. Expo) should always get fresh data.
    const rows = await db.select().from(siteConfig);
    const map = new Map(
      rows.map((r) => [r.key, { value: r.value, type: r.type }]),
    );

    function get<T>(key: string, fallback: T): T {
      const row = map.get(key);
      if (!row) return fallback;
      try {
        if (row.type === "json") return JSON.parse(row.value) as T;
        if (row.type === "boolean")
          return (row.value === "true") as unknown as T;
        if (row.type === "number") return Number(row.value) as unknown as T;
        return row.value as unknown as T;
      } catch {
        return fallback;
      }
    }

    return ok({
      siteName: get("site_name", "Riziki"),
      siteTagline: get("site_tagline", "Discover your style"),
      logoPublicId: get("logo_public_id", null),
      logoBlurDataUrl: get("logo_blur_data_url", null),
      logoUrl: get("logo_url", null),
      activeDepartments: get("active_departments", ["men", "women", "beauty"]),
      primaryColor: get("primary_color", "#000000"),
      seoDescription: get(
        "seo_description",
        "Shop the latest fashion trends at Riziki.",
      ),
      whatsappNumber: get("whatsapp_number", null),
      currency: get("currency", "KES"),
      currencySymbol: get("currency_symbol", "KSh"),
      shippingPolicy: get("shipping_policy", null),
      returnsPolicy: get("returns_policy", null),
      socialLinks: get("social_links", {}),
      contactEmail: get("contact_email", null),
    });
  } catch (e) {
    console.error("[config GET]", e);
    return serverError();
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Skip null / empty-string values — don't overwrite existing DB data
    const entries = Object.entries(body).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    );

    if (entries.length === 0) return ok({ updated: 0 });

    // Upsert each key
    await Promise.all(
      entries.map(([key, value]) => {
        const type =
          typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
              ? "number"
              : Array.isArray(value) || typeof value === "object"
                ? "json"
                : "string";

        const serialized =
          type === "json" ? JSON.stringify(value) : String(value);

        return db
          .insert(siteConfig)
          .values({ key, value: serialized, type })
          .onConflictDoUpdate({
            target: siteConfig.key,
            set: {
              value: serialized,
              type,
              updatedAt: new Date(),
            },
          });
      }),
    );

    // Bust the site config cache
    revalidateTag(CACHE_TAGS.siteConfig);

    return ok({ updated: Object.keys(body).length });
  } catch (e) {
    console.error("[config PUT]", e);
    return serverError();
  }
}
