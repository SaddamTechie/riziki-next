/**
 * Mega menu — fully DB-driven, admin configurable.
 *
 * Structure:
 *   MegaMenuSection  (e.g. "New In", "Clothing", "Shoes", "Vacay Nights")
 *     └── MegaMenuItems  (e.g. "New Edits" → /new-edits, or image card)
 */

import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { departmentEnum } from "./categories";

export const megaMenuSections = pgTable("mega_menu_sections", {
  id: text("id").primaryKey(),
  department: departmentEnum("department").notNull(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const megaMenuItems = pgTable("mega_menu_items", {
  id: text("id").primaryKey(),
  sectionId: text("section_id")
    .notNull()
    .references(() => megaMenuSections.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  /**
   * If imagePublicId is set, this item is rendered as an editorial image card
   * (e.g. "Vacay Nights", "New for Spring") instead of a plain link.
   */
  imagePublicId: text("image_public_id"),
  imageUrl: text("image_url"),
  imageBlurDataUrl: text("image_blur_data_url"),
  /** Optional badge text — e.g. "NEW", "SALE", "HOT" */
  badge: text("badge"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
