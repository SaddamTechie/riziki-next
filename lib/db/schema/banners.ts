/**
 * Banners — hero and promotional banners shown on the homepage.
 * Support video (for hero banners) and images.
 * Department-scoped so the right content shows per department.
 */

import { pgTable, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { departmentEnum } from "./categories";

export const bannerTypeEnum = pgEnum("banner_type", ["hero", "promo", "strip"]);

export const banners = pgTable("banners", {
  id: text("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  department: departmentEnum("department").notNull().default("all"),
  type: bannerTypeEnum("type").notNull().default("hero"),

  // Image
  imagePublicId: text("image_public_id"),
  imageUrl: text("image_url"),
  imageBlurDataUrl: text("image_blur_data_url"),

  // Video (hero banners only — autoplay muted loop)
  videoPublicId: text("video_public_id"),
  videoUrl: text("video_url"),

  /** Overlay text color — "light" (white text) or "dark" (dark text) */
  textTheme: text("text_theme").notNull().default("light"),

  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
});
