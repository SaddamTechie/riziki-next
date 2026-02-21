/**
 * Drizzle ORM client — Neon serverless driver.
 *
 * Uses the HTTP driver (neon()) for serverless/edge environments.
 * Configures automatic retries to handle Neon cold-start timeouts
 * (free tier suspends compute after ~5 min of inactivity).
 */

import "server-only";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

// ─── Retry fetch for Neon cold-start ─────────────────────────────────────────
// When Neon compute is suspended the first HTTP request can ETIMEDOUT while
// the compute wakes up (~0.5–2 s). Retry up to 3× with short backoff.
neonConfig.fetchFunction = async (
  url: RequestInfo,
  init?: RequestInit,
): Promise<Response> => {
  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastErr;
};

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type Database = typeof db;
