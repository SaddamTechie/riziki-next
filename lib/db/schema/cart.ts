/**
 * Cart — supports both authenticated users and guests.
 * Guest carts use a sessionId (UUID stored in cookie).
 * On login, guest cart is merged into user cart.
 */

import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { productVariants } from "./products";
import { user } from "./auth";

export const carts = pgTable("carts", {
  id: text("id").primaryKey(),
  /** Null for guest carts */
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  /** UUID stored in cookie for guest cart identification */
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});
