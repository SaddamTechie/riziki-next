"use client";

import { useWishlistStore } from "@/stores/wishlist.store";
import { useProducts } from "@/hooks/use-store-queries";
import { ProductCard } from "@/components/store/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { productIds } = useWishlistStore();

  const { data: allProducts, isLoading } = useProducts(
    {},
    { enabled: productIds.length > 0, staleTime: 1000 * 60 * 5 },
  );

  const wishlistProducts = (allProducts ?? []).filter((p) =>
    productIds.includes(p.id),
  );

  if (productIds.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-heading text-xl font-bold">Wishlist</h1>
        <div className="rounded-xl border bg-card p-12 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="font-medium">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save items you love by tapping the heart icon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl font-bold">
        Wishlist
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({productIds.length} items)
        </span>
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {productIds.map((id) => (
            <div key={id} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                brand: product.brand,
                isNew: product.isNew,
                isSale: product.isSale,
                imagePublicId: product.imagePublicId,
                imageBlurDataUrl: product.imageBlurDataUrl,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
