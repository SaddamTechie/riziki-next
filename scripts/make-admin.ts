/**
 * Promote an existing user to admin role.
 *
 * Usage:
 *   npm run make-admin -- your@email.com
 */

import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filePath), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* ignore */
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { user } from "../lib/db/schema/auth";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set.");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-admin -- your@email.com");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

const [updated] = await db
  .update(user)
  .set({ role: "admin" })
  .where(eq(user.email, email))
  .returning({ id: user.id, email: user.email, name: user.name });

if (!updated) {
  console.error(`❌  No user found with email: ${email}`);
  console.error("    Sign up at /sign-up first, then run this script.");
  process.exit(1);
}

console.log(`✅  ${updated.name ?? updated.email} is now an admin.`);
process.exit(0);
