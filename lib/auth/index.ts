/**
 * Better Auth instance configuration.
 * The auth object is a singleton used in both API routes and server components.
 *
 * Reference: https://www.better-auth.com/docs/installation
 */

import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  // ─── Database ─────────────────────────────────────────────────────────────
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // ─── Base URL ─────────────────────────────────────────────────────────────
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // ─── Email + Password ─────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set to true when email is configured
  },

  // ─── Session ──────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache for 5 minutes (reduces DB reads)
    },
  },

  // ─── User fields ──────────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // not user-supplied — set programmatically
      },
    },
  },

  // ─── Advanced ─────────────────────────────────────────────────────────────
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    cookiePrefix: "riziki",
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
