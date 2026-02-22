/**
 * DELETE /api/products/:id/images/:imageId  — Delete a product image (admin)
 */

import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productImages, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { storage } from "@/lib/storage";
import { revalidateTag } from "@/lib/cache/revalidate";
import { CACHE_TAGS } from "@/lib/cache/keys";
import {
  noContent,
  notFound,
  requireAdmin,
  isErrorResponse,
  serverError,
} from "@/lib/api/helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const authResult = await requireAdmin();
  if (isErrorResponse(authResult)) return authResult;

  try {
    const { id, imageId } = await params;

    const [deleted] = await db
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning({ publicId: productImages.publicId });

    if (!deleted) return notFound("Image not found");

    // Fire-and-forget Cloudinary cleanup
    storage
      .delete(deleted.publicId)
      .catch((e) =>
        console.error("[image DELETE] cloudinary cleanup failed", e),
      );

    const [product] = await db
      .select({ slug: products.slug, department: products.department })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (product) {
      revalidateTag(CACHE_TAGS.product(product.slug));
      revalidateTag(CACHE_TAGS.productsByDept(product.department));
    }

    return noContent();
  } catch (e) {
    console.error("[image DELETE]", e);
    return serverError();
  }
}
