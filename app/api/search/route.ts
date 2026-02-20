import { searchProducts } from "@/lib/search";
import { ok, badRequest, serverError } from "@/lib/api/helpers";
import { type NextRequest } from "next/server";

export const runtime = "edge"; // fast edge search

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const department = searchParams.get("dept") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    if (!query.trim()) return badRequest("Search query is required");

    const results = await searchProducts({ query, department, limit, offset });
    return ok(results);
  } catch (e) {
    console.error("[search]", e);
    return serverError();
  }
}
