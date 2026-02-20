import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { productVariants } from "./products";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "payment_pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  /** Guest checkout — email for order confirmation */
  guestEmail: text("guest_email"),
  status: orderStatusEnum("status").notNull().default("pending"),

  // Totals (stored in decimal, e.g. KES 1500.00)
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("KES"),

  // Shipping
  shippingName: text("shipping_name"),
  shippingPhone: text("shipping_phone"),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingCountry: text("shipping_country"),

  // Payment
  /** Which payment provider was used */
  paymentProvider: text("payment_provider"),
  /** Provider-specific payment reference */
  paymentRef: text("payment_ref"),
  paidAt: timestamp("paid_at"),

  /** True if this order was initiated via WhatsApp buy button */
  isWhatsappOrder: boolean("is_whatsapp_order").notNull().default(false),

  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  /** Snapshot of product name at time of order (never changes even if product edited) */
  productName: text("product_name").notNull(),
  /** Snapshot of variant details */
  variantSize: text("variant_size").notNull(),
  variantColor: text("variant_color").notNull(),
  sku: text("sku"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  county: text("county"),
  country: text("country").notNull().default("Kenya"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
