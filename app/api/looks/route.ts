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
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  coverImagePublicId: z.string().optional(),
  coverImageUrl: z.string().optional(),
  coverImageBlurDataUrl: z.string().optional(),
  department: z.enum(["men", "women", "beauty", "all"]).default("all"),
  productIds: z.array(z.string()).min(2).max(6),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const parsed = createLookSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.message);

    const { productIds, ...lookData } = parsed.data;
    const id = generateId();

    await db.insert(looks).values({ id, ...lookData });

    await db.insert(lookItems).values(
      productIds.map((productId, i) => ({
        id: generateId(),
        lookId: id,
        productId,
        sortOrder: i,
      })),
    );

    revalidateTag(CACHE_TAGS.looks);
    revalidateTag(CACHE_TAGS.looksByDept(parsed.data.department));

    return created({ id });
  } catch (e) {
    console.error("[looks POST]", e);
    return serverError();
  }
}
