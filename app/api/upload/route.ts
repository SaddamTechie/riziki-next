/**
 * POST /api/upload/signed    — Returns signed params for direct client upload
 * POST /api/upload/server    — Accepts file and uploads server-side (for admin)
 */

import { type NextRequest } from "next/server";
import { storage } from "@/lib/storage";
import {
  ok,
  created,
  badRequest,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

const signedParamsSchema = z.object({
  folder: z
    .enum(["products", "banners", "looks", "categories", "avatars", "config"])
    .default("products"),
});

/** GET signed upload params for direct browser → Cloudinary upload */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = signedParamsSchema.safeParse({
      folder: searchParams.get("folder") ?? "products",
    });
    if (!parsed.success) return badRequest(parsed.error.message);

    const params = await storage.signedUploadParams({
      folder: parsed.data.folder,
    });
    return ok(params);
  } catch (e) {
    console.error("[upload signed GET]", e);
    return serverError();
  }
}

/** POST a base64 or URL for server-side upload (e.g. from admin form) */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const { file, folder = "products" } = body as {
      file: string;
      folder?: string;
    };

    if (!file) return badRequest("file is required");

    const result = await storage.upload(file, {
      folder: folder as
        | "products"
        | "banners"
        | "looks"
        | "categories"
        | "avatars"
        | "config",
    });

    return created(result);
  } catch (e) {
    console.error("[upload POST]", e);
    return serverError();
  }
}
