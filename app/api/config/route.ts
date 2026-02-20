/**
 * GET /api/config     — Get site config (public)
 * PUT /api/config     — Update site config (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import { getSiteConfig } from "@/lib/config/site";
import {
  ok,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";

export async function GET() {
  try {
    const config = await getSiteConfig();
    return ok(config);
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

    // Upsert each key
    await Promise.all(
      Object.entries(body).map(([key, value]) => {
        const type =
          typeof value === "boolean"
            ? "boolean"
            : typeof value === "number"
              ? "number"
              : typeof value === "object"
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
