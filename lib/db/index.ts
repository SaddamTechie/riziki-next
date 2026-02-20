/**
 * Drizzle ORM client — Neon serverless driver.
 *
 * Uses the HTTP driver (neon()) for serverless/edge environments.
 * For long-running server processes, swap to neonPool() with connection pooling.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});

export type Database = typeof db;
