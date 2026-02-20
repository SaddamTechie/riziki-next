/**
 * Typed cache tag constants.
 * Always import from here — never use raw strings.
 * Consistent tags ensure revalidation always hits the right cache entries.
 */

export const CACHE_TAGS = {
  // Site-level
  siteConfig: "site-config" as const,

  // Navigation
  megaMenu: (department: string) => `mega-menu-${department}` as const,
  categories: "categories" as const,
  categoriesByDept: (department: string) => `categories-${department}` as const,

  // Products
  products: "products" as const,
  productsByDept: (department: string) => `products-${department}` as const,
  productsByCategory: (categorySlug: string) =>
    `products-cat-${categorySlug}` as const,
  product: (slug: string) => `product-${slug}` as const,
  featuredProducts: "featured-products" as const,

  // Looks
  looks: "looks" as const,
  looksByDept: (department: string) => `looks-${department}` as const,
  look: (slug: string) => `look-${slug}` as const,

  // Banners
  banners: "banners" as const,
  bannersByDept: (department: string) => `banners-${department}` as const,
} as const;

/** Cache TTLs in seconds */
export const CACHE_TTL = {
  /** Never expires — revalidated only on admin update */
  indefinite: 2_147_483_647,
  /** 1 hour */
  hour: 3600,
  /** 24 hours */
  day: 86400,
  /** 5 minutes — for near-real-time data */
  short: 300,
} as const;
