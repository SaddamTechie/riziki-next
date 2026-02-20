/**
 * API utilities — shared across all Route Handlers.
 * Keeps route files thin and consistent.
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "@/lib/auth";

// ─── Response helpers ─────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Get the current session. Returns null if not authenticated. */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/** Require authentication. Returns session or a 401 response. */
export async function requireAuth(): Promise<
  Session | ReturnType<typeof unauthorized>
> {
  const session = await getSession();
  if (!session) return unauthorized();
  return session;
}

/** Require admin role. Returns session or a 403 response. */
export async function requireAdmin(): Promise<
  Session | ReturnType<typeof forbidden>
> {
  const session = await getSession();
  if (!session) return unauthorized();
  if ((session.user as { role?: string }).role !== "admin") return forbidden();
  return session;
}

/** Type guard: check if the result is a NextResponse (error) */
export function isErrorResponse(
  value: unknown,
): value is ReturnType<typeof unauthorized> {
  return value instanceof NextResponse;
}

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID();
}

/** Generate a human-readable order number, e.g. RZK-20260220-ABC123 */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `RZK-${date}-${random}`;
}
