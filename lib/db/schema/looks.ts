/**
 * Buy the Look — admin-curated outfit collections.
 * Each look is a named outfit with a cover image and 2–6 products.
 */

import { pgTable, text, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { departmentEnum } from "./categories";
import { products } from "./products";

export const looks = pgTable("looks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImagePublicId: text("cover_image_public_id"),
  coverImageUrl: text("cover_image_url"),
  coverImageBlurDataUrl: text("cover_image_blur_data_url"),
  /** Pre-computed total price — updated when items change */
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }),
  department: departmentEnum("department").notNull().default("all"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

export const lookItems = pgTable("look_items", {
  id: text("id").primaryKey(),
  lookId: text("look_id")
    .notNull()
    .references(() => looks.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});
