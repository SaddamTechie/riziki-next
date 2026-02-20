"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

const LAST_SIZE_KEY = "riziki_last_size";

interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
  price: number;
}

interface VariantPickerProps {
  productId: string;
  productName: string;
  productSlug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  variants: Variant[];
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
  whatsappLink: string;
}

export function VariantPicker({
  productId,
  productName,
  productSlug,
  basePrice,
  compareAtPrice,
  variants,
  imagePublicId,
  imageBlurDataUrl,
  whatsappLink,
}: VariantPickerProps) {
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(productId);

  // Unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const hasColors =
    colors.length > 1 || (colors.length === 1 && colors[0] !== "");

  // Pre-select remembered size
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const last = localStorage.getItem(LAST_SIZE_KEY);
      if (last && sizes.includes(last)) return last;
    }
    return sizes[0] ?? "";
  });
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [addedAnim, setAddedAnim] = useState(false);

  // Persist size selection
  useEffect(() => {
    if (selectedSize) localStorage.setItem(LAST_SIZE_KEY, selectedSize);
  }, [selectedSize]);

  const selectedVariant =
    variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor,
    ) ?? variants.find((v) => v.size === selectedSize);

  const currentPrice = selectedVariant?.price ?? basePrice;
  const isOOS = selectedVariant ? selectedVariant.stock === 0 : false;

  const discountPercent =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : null;

  function handleAddToCart() {
    if (!selectedVariant || isOOS) return;
    addItem({
      variantId: selectedVariant.id,
      productId,
      productName,
      productSlug,
      imagePublicId,
      imageBlurDataUrl: imageBlurDataUrl ?? undefined,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.price,
      compareAtPrice: compareAtPrice ?? undefined,
      quantity: 1,
      maxStock: selectedVariant.stock,
    });
    openCart();
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
    toast.success("Added to bag!", { description: productName });
  }

  return (
    <div className="space-y-5">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-2xl font-bold">
          {formatPrice(currentPrice, "KES")}
        </span>
        {compareAtPrice && compareAtPrice > currentPrice && (
          <span className="text-base text-muted-foreground line-through">
            {formatPrice(compareAtPrice, "KES")}
          </span>
        )}
        {discountPercent && (
          <Badge variant="destructive" className="ml-1">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* Color picker */}
      {hasColors && (
        <div>
          <p className="mb-2 text-sm font-medium">
            Colour: <span className="font-normal">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const colorVariant = variants.find(
                (v) => v.color === color && v.size === selectedSize,
              );
              const oos = colorVariant ? colorVariant.stock === 0 : false;
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={oos}
                  title={color}
                  className={cn(
                    "relative h-8 w-8 rounded-full border-2 transition-all",
                    selectedColor === color
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-foreground/50",
                    oos && "opacity-30 cursor-not-allowed",
                  )}
                  style={{
                    backgroundColor:
                      colorVariant?.colorHex ?? color.toLowerCase(),
                  }}
                  aria-label={color}
                  aria-pressed={selectedColor === color}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size picker */}
      <div>
        <p className="mb-2 text-sm font-medium">
          Size: <span className="font-normal">{selectedSize}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const sizeVariant =
              variants.find(
                (v) => v.size === size && v.color === selectedColor,
              ) ?? variants.find((v) => v.size === size);
            const oos = sizeVariant ? sizeVariant.stock === 0 : true;
            return (
              <button
                key={size}
                onClick={() => !oos && setSelectedSize(size)}
                className={cn(
                  "relative min-w-[3rem] rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-input hover:border-foreground/60",
                  oos &&
                    "border-dashed text-muted-foreground cursor-default opacity-50 hover:border-input",
                )}
                aria-label={`${size}${oos ? " (out of stock)" : ""}`}
                aria-pressed={selectedSize === size}
              >
                {size}
                {oos && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="absolute h-px w-full rotate-[-30deg] bg-muted-foreground/40" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add to cart */}
      <div className="flex gap-3">
        <motion.div
          className="flex-1"
          animate={addedAnim ? { scale: [1, 0.97, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={handleAddToCart}
            disabled={isOOS || !selectedVariant}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOOS ? "Out of Stock" : "Add to Bag"}
          </Button>
        </motion.div>

        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11"
          onClick={() => toggleWishlist(productId)}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              wishlisted && "fill-destructive text-destructive",
            )}
          />
        </Button>
      </div>

      {/* WhatsApp Buy */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border border-green-500 px-4 py-2.5",
          "bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors",
          "dark:bg-green-950 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900",
        )}
      >
        <MessageCircle className="h-4 w-4" />
        Buy via WhatsApp
      </a>
    </div>
  );
}
