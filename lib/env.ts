import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables.
 * The app will throw at build/startup if any required variable is missing.
 * Import this instead of process.env directly.
 */
export const env = createEnv({
  // ─── Server-only variables ─────────────────────────────────────────────────
  server: {
    // Database
    DATABASE_URL: z.string().url(),

    // Better Auth
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),

    // Cloudinary (storage provider)
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    // Payment (provider-agnostic — fill in what you use)
    // Daraja (M-Pesa) — leave empty until integrated
    PAYMENT_CONSUMER_KEY: z.string().optional(),
    PAYMENT_CONSUMER_SECRET: z.string().optional(),
    PAYMENT_SHORTCODE: z.string().optional(),
    PAYMENT_PASSKEY: z.string().optional(),
    PAYMENT_CALLBACK_URL: z.string().url().optional(),

    // Node environment
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Trusted origins for mobile/Expo clients (comma-separated URLs)
    // e.g. exp://192.168.1.5:8081,http://localhost:8081
    EXPO_ORIGIN: z.string().optional(),
  },

  // ─── Client-safe variables ─────────────────────────────────────────────────
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
    // WhatsApp — store owner's number (international format, no +)
    NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  },

  // ─── Runtime mappings ──────────────────────────────────────────────────────
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    PAYMENT_CONSUMER_KEY: process.env.PAYMENT_CONSUMER_KEY,
    PAYMENT_CONSUMER_SECRET: process.env.PAYMENT_CONSUMER_SECRET,
    PAYMENT_SHORTCODE: process.env.PAYMENT_SHORTCODE,
    PAYMENT_PASSKEY: process.env.PAYMENT_PASSKEY,
    PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL,
    NODE_ENV: process.env.NODE_ENV,
    EXPO_ORIGIN: process.env.EXPO_ORIGIN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },

  // Don't throw during build for missing vars (useful for CI)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Treat empty strings as undefined
  emptyStringAsUndefined: true,
});
