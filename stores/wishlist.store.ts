/**
 * Wishlist store — Zustand with localStorage persistence.
 * Stores product IDs only (not full product data — avoids stale data).
 * Full product data is fetched from the API when the wishlist page renders.
 *
 * For authenticated users, wishlist is also synced to DB via the API.
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  // ─── Computed ──────────────────────────────────────────────────────────────
  isWishlisted: (productId: string) => boolean;
  count: () => number;
  // ─── Actions ───────────────────────────────────────────────────────────────
  toggleWishlist: (productId: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  /** Replace local wishlist with server data (after login) */
  syncFromServer: (productIds: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      isWishlisted: (productId) => get().productIds.includes(productId),

      count: () => get().productIds.length,

      toggleWishlist: (productId) => {
        const isIn = get().productIds.includes(productId);
        if (isIn) {
          get().removeFromWishlist(productId);
        } else {
          get().addToWishlist(productId);
        }
      },

      addToWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        })),

      removeFromWishlist: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      clearWishlist: () => set({ productIds: [] }),

      syncFromServer: (productIds) => set({ productIds }),
    }),
    {
      name: "riziki-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
