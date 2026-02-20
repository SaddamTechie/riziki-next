import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { products } from "./products";

export const wishlists = pgTable("wishlists", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: text("id").primaryKey(),
  wishlistId: text("wishlist_id")
    .notNull()
    .references(() => wishlists.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

/**
 * Recently viewed — persisted to DB for logged-in users.
 * For guests, this lives in localStorage (client-side only).
 */
export const recentlyViewed = pgTable("recently_viewed", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});
