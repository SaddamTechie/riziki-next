"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { StorageImage } from "@/components/shared/storage-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  /** Price in whole units (KES) */
  price: number;
  compareAtPrice?: number | null;
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
  /** Optional hover image public ID for alternate view */
  hoverImagePublicId?: string | null;
  brand?: string | null;
  isNew?: boolean;
  isSale?: boolean;
  /** Default variant for quick-add */
  defaultVariantId?: string | null;
  defaultVariantMaxStock?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  /** Controls aspect ratio; default 3/4 (portrait) */
  aspectRatio?: string;
  className?: string;
  /** Row span for masonry layouts */
  rowSpan?: number;
}

export function ProductCard({
  product,
  aspectRatio = "3/4",
  className,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const wishlisted = isWishlisted(product.id);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.defaultVariantId) return;
    addItem({
      variantId: product.defaultVariantId,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imagePublicId: product.imagePublicId,
      imageBlurDataUrl: product.imageBlurDataUrl ?? undefined,
      size: "",
      color: "",
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      quantity: 1,
      maxStock: product.defaultVariantMaxStock ?? 99,
    });
    openCart();
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleWishlist(product.id);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group relative block", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div
        className="relative w-full overflow-hidden rounded-lg bg-muted"
        style={{ aspectRatio }}
      >
        {/* Primary image */}
        <StorageImage
          src={product.imagePublicId}
          blurDataUrl={product.imageBlurDataUrl ?? undefined}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 ease-out",
            hovered && product.hoverImagePublicId ? "opacity-0" : "opacity-100",
            hovered && !product.hoverImagePublicId && "scale-105",
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Hover / alternate image */}
        {product.hoverImagePublicId && (
          <StorageImage
            src={product.hoverImagePublicId}
            alt={`${product.name} — alternate view`}
            fill
            className={cn(
              "absolute inset-0 object-cover transition-all duration-500 ease-out",
              hovered ? "opacity-100 scale-105" : "opacity-0 scale-100",
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              New
            </Badge>
          )}
          {discountPercent && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm border",
            "transition-colors hover:bg-background",
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            hovered || wishlisted
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.8 }
          }
          transition={{ duration: 0.15 }}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              wishlisted
                ? "fill-destructive text-destructive"
                : "text-foreground",
            )}
          />
        </motion.button>

        {/* Quick-add button (only if there's a default variant) */}
        {product.defaultVariantId && (
          <motion.div
            className="absolute bottom-2 left-2 right-2"
            initial={{ opacity: 0, y: 8 }}
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              size="sm"
              className="w-full gap-2 text-xs"
              onClick={handleQuickAdd}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Quick Add
            </Button>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5 px-0.5">
        {product.brand && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
        )}
        <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:underline">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatPrice(product.price, "KES")}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice, "KES")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
