/**
 * GET  /api/looks      — Get looks for a department
 * POST /api/looks      — Create a look (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  looks,
  lookItems,
  products,
  productImages,
  productVariants,
} from "@/lib/db/schema";
import { eq, and, asc, min } from "drizzle-orm";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  ok,
  created,
  badRequest,
  requireAdmin,
  isErrorResponse,
  generateId,
  serverError,
} from "@/lib/api/helpers";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("dept");

    const conditions = [eq(looks.isActive, true)];
    if (department) {
      conditions.push(
        eq(looks.department, department as "men" | "women" | "beauty" | "all"),
      );
    }

    const looksData = await db
      .select()
      .from(looks)
      .where(and(...conditions))
      .orderBy(asc(looks.sortOrder));

    return ok(looksData);
  } catch (e) {
    console.error("[looks GET]", e);
    return serverError();
  }
}

const createLookSchema = z.object({
  name: z.string().min(1),
  // Auto-generated from name if omitted
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  coverImagePublicId: z.string().optional(),
  coverImageUrl: z.string().optional(),
  coverImageBlurDataUrl: z.string().optional(),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  // Allow creating a look with no products yet (products can be added later via PATCH)
  productIds: z.array(z.string()).max(6).default([]),
});

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createLookSchema.safeParse(body);
    if (!parsed.success) {
      console.error("[looks POST] validation:", parsed.error.flatten());
      return badRequest(parsed.error.message);
    }

    const { productIds, slug: slugInput, ...lookData } = parsed.data;
    const slug = slugInput ?? toSlug(lookData.name);
    const id = generateId();

    await db.insert(looks).values({ id, slug, ...lookData });

    if (productIds.length > 0) {
      await db.insert(lookItems).values(
        productIds.map((productId, i) => ({
          id: generateId(),
          lookId: id,
          productId,
          sortOrder: i,
        })),
      );
    }

    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(parsed.data.department));

    return created({ id, slug });
  } catch (e) {
    console.error("[looks POST]", e);
    return serverError();
  }
}
