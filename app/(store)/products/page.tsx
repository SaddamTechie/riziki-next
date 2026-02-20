import { Suspense } from "react";
import { db } from "@/lib/db";
import { products, productImages, categories } from "@/lib/db/schema";
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/keys";
import type { Metadata } from "next";
import { VirtualProductGrid } from "@/components/store/product/virtual-product-grid";
import {
  ProductFilters,
  ActiveFilterChips,
  type FilterGroup,
} from "@/components/store/product/product-filters";
import { SortSelector } from "@/components/store/product/sort-selector";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full collection of fashion, accessories and more.",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Department = "men" | "women" | "beauty" | "all";
type SortKey = "newest" | "price_asc" | "price_desc" | "popular";

interface SearchParams {
  department?: string;
  category?: string;
  sort?: string;
  sale?: string;
  brand?: string;
  page?: string;
}

// ─── Data helpers (cached) ────────────────────────────────────────────────────

const getCategories = unstable_cache(
  async () => {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        department: categories.department,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.name));
  },
  ["categories-list"],
  { tags: [CACHE_TAGS.categories], revalidate: CACHE_TTL.day },
);

async function getProducts(params: SearchParams) {
  const department = params.department as Department | undefined;
  const sort = (params.sort ?? "newest") as SortKey;
  const sale = params.sale === "true";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 48;
  const offset = (page - 1) * limit;

  const conditions = [eq(products.isActive, true)];
  if (department && department !== "all") {
    conditions.push(eq(products.department, department));
  }
  if (sale) conditions.push(eq(products.isSale, true));
  if (params.category)
    conditions.push(eq(products.categoryId, params.category));
  if (params.brand) conditions.push(eq(products.brand, params.brand));

  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
        ? desc(products.price)
        : sort === "popular"
          ? desc(products.isFeatured)
          : desc(products.createdAt);

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      brand: products.brand,
      isNew: products.isNew,
      isSale: products.isSale,
      imagePublicId: productImages.publicId,
      imageBlurDataUrl: productImages.blurDataUrl,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isPrimary, true),
      ),
    )
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(...conditions));

  return {
    items: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      price: parseFloat(r.price ?? "0"),
      compareAtPrice: r.compareAtPrice ? parseFloat(r.compareAtPrice) : null,
      brand: r.brand,
      isNew: r.isNew,
      isSale: r.isSale ?? undefined,
      imagePublicId: r.imagePublicId ?? "",
      imageBlurDataUrl: r.imageBlurDataUrl,
    })),
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
}

// ─── Filter groups builder ────────────────────────────────────────────────────

function buildFilterGroups(
  cats: Array<{
    id: string;
    name: string;
    slug: string;
    department: string | null;
  }>,
  department?: string,
): FilterGroup[] {
  const filteredCats = cats.filter(
    (c) =>
      !department ||
      department === "all" ||
      c.department === department ||
      c.department === "all",
  );

  return [
    {
      id: "category",
      label: "Category",
      options: filteredCats.map((c) => ({ label: c.name, value: c.id })),
    },
    {
      id: "sale",
      label: "Offers",
      options: [{ label: "Sale", value: "true" }],
    },
    {
      id: "sort",
      label: "Sort by",
      options: [
        { label: "Newest", value: "newest" },
        { label: "Price: Low to High", value: "price_asc" },
        { label: "Price: High to Low", value: "price_desc" },
      ],
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ items, total }, cats] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const filterGroups = buildFilterGroups(cats, params.department);

  const heading =
    params.sale === "true"
      ? "Sale"
      : params.department === "women"
        ? "Women"
        : params.department === "men"
          ? "Men"
          : params.department === "beauty"
            ? "Beauty"
            : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {heading}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} items</p>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar (desktop) + sheet (mobile) */}
        <Suspense fallback={null}>
          <ProductFilters groups={filterGroups} total={total} />
        </Suspense>

        {/* Main grid */}
        <div className="min-w-0 flex-1">
          {/* Active filter chips + sort */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <Suspense fallback={null}>
              <ActiveFilterChips groups={filterGroups} />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-9 w-44" />}>
              <SortSelector />
            </Suspense>
          </div>

          {/* Product cards */}
          <VirtualProductGrid products={items} />

          {/* Simple pagination */}
          {total > 48 && (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              Showing {Math.min(total, 48)} of {total} items —{" "}
              <span className="font-medium">Scroll to load more</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
