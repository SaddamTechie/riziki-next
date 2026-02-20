import { pgTable, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

/** Departments the store can be scoped to. */
export const departmentEnum = pgEnum("department", [
  "men",
  "women",
  "beauty",
  "all",
]);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imagePublicId: text("image_public_id"),
  imageBlurDataUrl: text("image_blur_data_url"),
  department: departmentEnum("department").notNull().default("all"),
  /** Self-referential: null = top-level category */
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
