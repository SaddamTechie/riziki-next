/**
 * Cart store — Zustand with localStorage persistence.
 *
 * For authenticated users, the cart is also synced to the DB via the API.
 * For guests, this localStorage cart is what they use until login/checkout.
 * On login, the client calls POST /api/cart/merge to merge guest → user cart.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  /** Primary image public ID */
  imagePublicId: string;
  imageBlurDataUrl?: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  /** Available stock — used to cap quantity increments */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // ─── Computed ──────────────────────────────────────────────────────────────
  itemCount: () => number;
  subtotal: () => number;
  // ─── Actions ───────────────────────────────────────────────────────────────
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === newItem.variantId,
          );
          if (existing) {
            // Increment, capped at maxStock
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + newItem.quantity,
                        i.maxStock,
                      ),
                    }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, newItem],
            isOpen: true,
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                    : i,
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "riziki-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist items — not the drawer open state
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
