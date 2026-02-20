import {
  pgTable,
  text,
  integer,
  boolean,
  numeric,
  index,
  customType,
} from "drizzle-orm/pg-core";

import { departmentEnum } from "./categories";

/**
 * tsvector custom type for PostgreSQL full-text search.
 * Updated via a DB trigger on insert/update.
 */
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    categoryId: text("category_id").notNull(),
    department: departmentEnum("department").notNull().default("all"),
    /** Tags used for "you may also like" and wishlist-based suggestions */
    tags: text("tags").array().notNull().default([]),
    /** Display price in whole units (e.g. KES). Shown on listing pages.
     *  Actual per-variant pricing lives in productVariants.price */
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    brand: text("brand"),
    isNew: boolean("is_new").notNull().default(false),
    isSale: boolean("is_sale").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    /**
     * Full-text search vector.
     * Populated by a DB trigger: name || description || tags
     * Queried with to_tsquery() in lib/search/index.ts
     */
    searchVector: tsvector("search_vector"),
    createdAt: text("created_at")
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
    updatedAt: text("updated_at")
      .$defaultFn(() => new Date().toISOString())
      .notNull(),
  },
  (table) => [
    index("products_search_idx").using("gin", table.searchVector),
    index("products_department_idx").on(table.department),
    index("products_category_idx").on(table.categoryId),
    index("products_slug_idx").on(table.slug),
  ],
);

export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  /** Cloudinary public ID (via storage abstraction) */
  publicId: text("public_id").notNull(),
  /** Full CDN URL */
  url: text("url").notNull(),
  /** Base64 blur placeholder generated at upload time */
  blurDataUrl: text("blur_data_url"),
  alt: text("alt"),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  /** e.g. "XS" | "S" | "M" | "L" | "XL" | "XXL" | "4" | "5" | "38" etc. */
  size: text("size").notNull(),
  /** e.g. "Black" | "Navy" | "#FF5733" */
  color: text("color").notNull(),
  colorHex: text("color_hex"),
  sku: text("sku").unique(),
  /** Price in smallest currency unit (e.g. cents/fils/stani) */
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});
