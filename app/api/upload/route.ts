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

type UploadFolder =
  | "products"
  | "banners"
  | "looks"
  | "categories"
  | "avatars"
  | "config";

/** POST a file for server-side upload (e.g. from admin form).
 *
 * Accepts two content types:
 *   - `multipart/form-data`  — field `file` (File/Blob) + optional field `folder`
 *   - `application/json`     — `{ file: "<base64 or URL>", folder?: "..." }`
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    let fileData: string;
    let folder: UploadFolder = "products";

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fileField = formData.get("file");
      const folderField = formData.get("folder");

      if (!fileField) return badRequest("file is required");

      if (folderField && typeof folderField === "string") {
        folder = folderField as UploadFolder;
      }

      if (fileField instanceof File) {
        // Convert File → base64 data URL for Cloudinary upload
        const buffer = await fileField.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        fileData = `data:${fileField.type};base64,${base64}`;
      } else {
        fileData = fileField as string;
      }
    } else {
      // JSON body: { file: string, folder?: string }
      const body = await request.json();
      const { file, folder: f = "products" } = body as {
        file: string;
        folder?: string;
      };
      if (!file) return badRequest("file is required");
      fileData = file;
      folder = f as UploadFolder;
    }

    const result = await storage.upload(fileData, { folder });

    return created(result);
  } catch (e) {
    console.error("[upload POST]", e);
    return serverError();
  }
}
