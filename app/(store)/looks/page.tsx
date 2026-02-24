import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { looks, lookItems, products, productImages } from "@/lib/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { BuyTheLookSection } from "@/components/store/looks/buy-the-look-section";
import { Badge } from "@/components/ui/badge";
import { getSiteConfig } from "@/lib/config/site";
import { CACHE_TAGS, CACHE_TTL } from "@/lib/cache/keys";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `Looks — ${config.siteName}`,
    description: `Shop curated outfit looks from ${config.siteName}. Editorial outfits, ready to wear.`,
    openGraph: {
      title: `Looks — ${config.siteName}`,
      description: `Shop curated outfit looks from ${config.siteName}.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Looks — ${config.siteName}`,
      description: `Shop curated outfit looks from ${config.siteName}.`,
    },
  };
}

type Dept = "men" | "women" | "beauty";

const DEPT_LABELS: Record<Dept, string> = {
  men: "Men",
  women: "Women",
  beauty: "Beauty",
};

function getLooks(dept?: Dept) {
  const cacheKey = dept ? `looks-browse-${dept}` : "looks-browse-all";
  return unstable_cache(
    async () => {
      const deptConditions = [
        eq(looks.isActive, true),
        ...(dept ? [eq(looks.department, dept)] : []),
      ];

      const looksData = await db
        .select()
        .from(looks)
        .where(and(...deptConditions))
        .orderBy(asc(looks.sortOrder));

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
    [cacheKey],
    { tags: [CACHE_TAGS.looks], revalidate: CACHE_TTL.hour },
  )();
}

export default async function LooksPage() {
  // Read the user's selected dept from the cookie (set by the top bar)
  const cookieDept = (await cookies()).get("riziki_dept")?.value as
    | Dept
    | undefined;
  const activeDept: Dept | undefined =
    cookieDept && ["men", "women", "beauty"].includes(cookieDept)
      ? cookieDept
      : undefined;

  const allLooks = await getLooks(activeDept);

  return (
    <div>
      {/* Page header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-2 text-xs">
            Editorial
          </Badge>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">
            The Looks
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeDept
              ? `${DEPT_LABELS[activeDept]} curated outfits, ready to shop.`
              : "Curated outfits, ready to shop."}
          </p>
        </div>
      </div>

      {/* Looks grid */}
      {allLooks.length > 0 ? (
        <BuyTheLookSection looks={allLooks} hideHeader />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">No looks available yet.</p>
        </div>
      )}
    </div>
  );
}
