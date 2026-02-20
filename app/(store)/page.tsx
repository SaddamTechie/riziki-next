import { Suspense } from "react";
import { db } from "@/lib/db";
import {
  banners,
  looks,
  lookItems,
  products,
  productImages,
} from "@/lib/db/schema";
import { eq, and, desc, asc, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/keys";
import { HeroBanner } from "@/components/store/banners/hero-banner";
import { BuyTheLookSection } from "@/components/store/looks/buy-the-look-section";
import { ProductCard } from "@/components/store/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// ─── Data fetchers (cached) ───────────────────────────────────────────────────

const getHeroBanners = unstable_cache(
  async () => {
    const now = new Date().toISOString();
    const rows = await db
      .select()
      .from(banners)
      .where(and(eq(banners.isActive, true), eq(banners.type, "hero")))
      .orderBy(asc(banners.sortOrder));

    return rows.filter((b) => {
      if (b.startsAt && b.startsAt > now) return false;
      if (b.endsAt && b.endsAt < now) return false;
      return true;
    });
  },
  ["home-hero-banners"],
  { tags: [CACHE_TAGS.banners], revalidate: CACHE_TTL.hour },
);

const getFeaturedLooks = unstable_cache(
  async () => {
    const looksData = await db
      .select()
      .from(looks)
      .where(eq(looks.isActive, true))
      .orderBy(asc(looks.sortOrder))
      .limit(3);

    if (!looksData.length) return [];

    const lookIds = looksData.map((l) => l.id);
    const items = await db
      .select({
        lookId: lookItems.lookId,
        productId: lookItems.productId,
        productSlug: products.slug,
        productName: products.name,
        price: products.price,
        imagePublicId: productImages.publicId,
      })
      .from(lookItems)
      .innerJoin(products, eq(lookItems.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true),
        ),
      )
      .where(inArray(lookItems.lookId, lookIds));

    return looksData.map((look) => ({
      id: look.id,
      slug: look.slug,
      title: look.name,
      imagePublicId: look.coverImagePublicId ?? "",
      imageBlurDataUrl: look.coverImageBlurDataUrl,
      totalPrice: parseFloat(look.totalPrice ?? "0"),
      items: items
        .filter((i) => i.lookId === look.id)
        .map((i) => ({
          productId: i.productId,
          productSlug: i.productSlug,
          productName: i.productName,
          imagePublicId: i.imagePublicId ?? "",
          price: parseFloat(i.price ?? "0"),
        })),
    }));
  },
  ["home-featured-looks"],
  { tags: [CACHE_TAGS.looks], revalidate: CACHE_TTL.hour },
);

const getNewArrivals = unstable_cache(
  async () => {
    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        brand: products.brand,
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
      .where(and(eq(products.isActive, true), eq(products.isNew, true)))
      .orderBy(desc(products.createdAt))
      .limit(8);

    return rows.map((r) => ({
      ...r,
      price: parseFloat(r.price ?? "0"),
      compareAtPrice: r.compareAtPrice ? parseFloat(r.compareAtPrice) : null,
      isNew: true,
      imagePublicId: r.imagePublicId ?? "",
    }));
  },
  ["home-new-arrivals"],
  { tags: [CACHE_TAGS.products], revalidate: CACHE_TTL.hour },
);

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function HeroBannerSkeleton() {
  return (
    <div className="relative w-full" style={{ aspectRatio: "16/7" }}>
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

async function HeroBannerSection() {
  const heroBanners = await getHeroBanners();
  return (
    <HeroBanner
      banners={heroBanners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        ctaText: b.ctaLabel,
        ctaUrl: b.ctaHref,
        mediaPublicId: b.imagePublicId ?? b.videoPublicId ?? "",
        mediaBlurDataUrl: b.imageBlurDataUrl,
        mediaType: b.videoPublicId ? "video" : "image",
        videoPublicId: b.videoPublicId,
      }))}
    />
  );
}

async function FeaturedLooksSection() {
  const featuredLooks = await getFeaturedLooks();
  return <BuyTheLookSection looks={featuredLooks} />;
}

async function NewArrivalsSection() {
  const newArrivals = await getNewArrivals();
  if (!newArrivals.length) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              Just Landed
            </Badge>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              New In
            </h2>
          </div>
          <Button variant="ghost" className="gap-1.5 text-sm" asChild>
            <Link href="/products?sort=newest">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product) => (
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
                isSale: product.isSale ?? undefined,
                imagePublicId: product.imagePublicId,
                imageBlurDataUrl: product.imageBlurDataUrl,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      {/* Hero banner */}
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerSection />
      </Suspense>

      {/* Buy the Look */}
      <Suspense
        fallback={
          <div className="py-16">
            <div className="mx-auto max-w-7xl px-4">
              <ProductGridSkeleton count={3} />
            </div>
          </div>
        }
      >
        <FeaturedLooksSection />
      </Suspense>

      {/* New Arrivals */}
      <Suspense
        fallback={
          <div className="py-16">
            <div className="mx-auto max-w-7xl px-4">
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        }
      >
        <NewArrivalsSection />
      </Suspense>

      {/* Sale promo strip */}
      <section className="bg-primary py-10 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-heading text-xl font-bold sm:text-2xl">
            Up to 50% Off Sale Items
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Limited time. While stocks last.
          </p>
          <Button variant="secondary" className="mt-4" asChild>
            <Link href="/products?sale=true">Shop the Sale</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
