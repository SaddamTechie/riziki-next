/**
 * TanStack Query hooks for the storefront.
 *
 * All hooks use the same cache key convention as CACHE_TAGS in lib/cache/keys.ts.
 * Server-side initial data can be passed via `initialData` to avoid re-fetching
 * data that was already fetched by a Server Component.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  brand?: string | null;
  isNew?: boolean;
  isSale?: boolean;
  department: string;
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
  hoverImagePublicId?: string | null;
  defaultVariantId?: string | null;
  defaultVariantMaxStock?: number;
}

export interface ProductDetail extends ProductListItem {
  description?: string | null;
  images: Array<{
    publicId: string;
    blurDataUrl?: string | null;
    altText?: string | null;
    displayOrder: number;
  }>;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
    price: number;
  }>;
}

export interface CartItemResponse {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  imagePublicId: string;
  imageBlurDataUrl?: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  maxStock: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
}

export interface BannerItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  mediaPublicId: string;
  mediaBlurDataUrl?: string | null;
  mediaType: "image" | "video";
  type: "hero" | "promo" | "strip";
}

export interface LookListItem {
  id: string;
  slug: string;
  title: string;
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
  totalPrice: number;
  items: Array<{
    productId: string;
    productSlug: string;
    productName: string;
    imagePublicId: string;
    price: number;
  }>;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const QueryKeys = {
  products: (params?: Record<string, unknown>) =>
    params ? ["products", params] : ["products"],
  product: (slug: string) => ["product", slug],
  banners: (dept?: string) => (dept ? ["banners", dept] : ["banners"]),
  looks: (dept?: string) => (dept ? ["looks", dept] : ["looks"]),
  megaMenu: (dept?: string) => (dept ? ["mega-menu", dept] : ["mega-menu"]),
  cart: () => ["cart"],
  wishlist: () => ["wishlist"],
  search: (query: string, dept?: string) => ["search", query, dept],
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface UseProductsParams {
  [key: string]: unknown;
  department?: string;
  category?: string;
  sort?: string;
  sale?: boolean;
  page?: number;
  limit?: number;
}

export function useProducts(
  params: UseProductsParams = {},
  options?: Partial<UseQueryOptions<ProductListItem[]>>,
) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      searchParams.set(k, String(v));
    }
  });
  const query = searchParams.toString();

  return useQuery<ProductListItem[]>({
    queryKey: QueryKeys.products(params),
    queryFn: () => fetchJSON(`/api/products${query ? `?${query}` : ""}`),
    staleTime: 1000 * 60 * 5, // 5 min
    ...options,
  });
}

export function useProduct(
  slug: string,
  options?: Partial<UseQueryOptions<ProductDetail>>,
) {
  return useQuery<ProductDetail>({
    queryKey: QueryKeys.product(slug),
    queryFn: () => fetchJSON(`/api/products/${slug}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
    ...options,
  });
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export function useBanners(
  department?: string,
  options?: Partial<UseQueryOptions<BannerItem[]>>,
) {
  const query = department ? `?department=${department}` : "";
  return useQuery<BannerItem[]>({
    queryKey: QueryKeys.banners(department),
    queryFn: () => fetchJSON(`/api/banners${query}`),
    staleTime: 1000 * 60 * 10, // 10 min
    ...options,
  });
}

// ─── Looks ────────────────────────────────────────────────────────────────────

export function useLooks(
  department?: string,
  options?: Partial<UseQueryOptions<LookListItem[]>>,
) {
  const query = department ? `?department=${department}` : "";
  return useQuery<LookListItem[]>({
    queryKey: QueryKeys.looks(department),
    queryFn: () => fetchJSON(`/api/looks${query}`),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(
  searchQuery: string,
  department?: string,
  options?: Partial<UseQueryOptions<ProductListItem[]>>,
) {
  const params = new URLSearchParams({ q: searchQuery });
  if (department) params.set("department", department);

  return useQuery<ProductListItem[]>({
    queryKey: QueryKeys.search(searchQuery, department),
    queryFn: () => fetchJSON(`/api/search?${params.toString()}`),
    enabled: searchQuery.trim().length >= 2,
    staleTime: 1000 * 60, // 1 min
    ...options,
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useServerCart(
  options?: Partial<UseQueryOptions<CartResponse>>,
) {
  return useQuery<CartResponse>({
    queryKey: QueryKeys.cart(),
    queryFn: () => fetchJSON("/api/cart"),
    staleTime: 0, // always fresh
    ...options,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { variantId: string; quantity: number }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add item");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.cart() }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.cart() }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cart item");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.cart() }),
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useServerWishlist(
  options?: Partial<UseQueryOptions<{ productIds: string[] }>>,
) {
  return useQuery<{ productIds: string[] }>({
    queryKey: QueryKeys.wishlist(),
    queryFn: () => fetchJSON("/api/wishlist"),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      action,
    }: {
      productId: string;
      action: "add" | "remove";
    }) => {
      const res = await fetch("/api/wishlist", {
        method: action === "add" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QueryKeys.wishlist() }),
  });
}
