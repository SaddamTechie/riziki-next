/**
 * Site configuration table.
 * Key/value store for all brand-level settings.
 * Fetched once, cached indefinitely, revalidated on admin save.
 *
 * Known keys (see lib/config/site.ts for defaults and types):
 *   site_name, site_tagline, logo_public_id, logo_blur_data_url,
 *   favicon_public_id, active_departments, primary_color,
 *   whatsapp_number, seo_description, social_links, ...
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  /** "string" | "number" | "boolean" | "json" — used for deserialization */
  type: text("type").notNull().default("string"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
