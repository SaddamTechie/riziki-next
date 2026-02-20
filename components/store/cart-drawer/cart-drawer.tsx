"use client";

import { toast } from "sonner";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StorageImage } from "@/components/shared/storage-image";
import { Minus, Plus, Trash2, ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCartStore();

  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const count = itemCount();
  const total = subtotal();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 font-heading text-base">
            <ShoppingBag className="h-5 w-5" />
            Your Bag
            {count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium">Your bag is empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add items to get started
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={closeCart}
                asChild
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <ul className="space-y-4">
                {items.map((item) => (
                  <motion.li
                    key={item.variantId}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex gap-3">
                      {/* Product image */}
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                        onClick={closeCart}
                      >
                        <StorageImage
                          src={item.imagePublicId}
                          blurDataUrl={item.imageBlurDataUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col gap-1">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="text-sm font-medium leading-tight hover:underline"
                          onClick={closeCart}
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {item.size} · {item.color}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.price, "KES")}
                        </p>

                        {/* Quantity controls */}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-0 rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity - 1,
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-none"
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1,
                                )
                              }
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Save to wishlist */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Save to wishlist"
                              onClick={() => toggleWishlist(item.productId)}
                            >
                              <Heart
                                className="h-3.5 w-3.5"
                                fill={
                                  isWishlisted(item.productId)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </Button>
                            {/* Remove */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              aria-label="Remove from cart"
                              onClick={() => {
                                removeItem(item.variantId);
                                toast("Item removed from bag");
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </motion.li>
                ))}
              </ul>
            </AnimatePresence>
          )}
        </div>

        {/* Footer — totals + CTA */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(total, "KES")}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping calculated at checkout
            </p>
            <Button className="w-full" size="lg" asChild onClick={closeCart}>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
