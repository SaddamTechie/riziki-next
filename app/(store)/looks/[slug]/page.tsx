import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { looks, lookItems, products, productImages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { StorageImage } from "@/components/shared/storage-image";
import { ProductCard } from "@/components/store/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatPrice, getOgImageUrl } from "@/lib/utils";
import { getSiteConfig } from "@/lib/config/site";
import { env } from "@/lib/env";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getSiteConfig();
  const [look] = await db
    .select({
      name: looks.name,
      description: looks.description,
      coverImagePublicId: looks.coverImagePublicId,
    })
    .from(looks)
    .where(and(eq(looks.slug, slug), eq(looks.isActive, true)))
    .limit(1);

  if (!look) return {};

  const ogImage = look.coverImagePublicId
    ? getOgImageUrl(
        look.coverImagePublicId,
        env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      )
    : undefined;
  const isCloudinaryUrl = ogImage?.includes("res.cloudinary.com");
  const ogImages = ogImage
    ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: look.name,
          ...(isCloudinaryUrl && { type: "image/jpeg" }),
        },
      ]
    : [{ url: "/logo.png", alt: config.siteName }];

  const description =
    look.description ?? `Shop the ${look.name} look on ${config.siteName}.`;

  return {
    title: `${look.name} — ${config.siteName}`,
    description,
    openGraph: {
      title: look.name,
      description,
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: look.name,
      description,
      images: ogImage ? [ogImage] : ["/logo.png"],
    },
  };
}

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getLook(slug: string) {
  const [look] = await db
    .select()
    .from(looks)
    .where(and(eq(looks.slug, slug), eq(looks.isActive, true)))
    .limit(1);

  if (!look) return null;

  const items = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      brand: products.brand,
      isNew: products.isNew,
      isSale: products.isSale,
      sortOrder: lookItems.sortOrder,
      imagePublicId: productImages.publicId,
      imageBlurDataUrl: productImages.blurDataUrl,
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
    .where(eq(lookItems.lookId, look.id))
    .orderBy(asc(lookItems.sortOrder));

  return {
    ...look,
    items: items.map((i) => ({
      id: i.id,
      slug: i.slug,
      name: i.name,
      price: parseFloat(i.price ?? "0"),
      compareAtPrice: i.compareAtPrice ? parseFloat(i.compareAtPrice) : null,
      brand: i.brand,
      isNew: i.isNew,
      isSale: i.isSale,
      imagePublicId: i.imagePublicId ?? "",
      imageBlurDataUrl: i.imageBlurDataUrl,
    })),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const look = await getLook(slug);
  if (!look) notFound();

  const totalPrice = parseFloat(look.totalPrice ?? "0");

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/looks">Looks</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{look.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Cover image */}
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted lg:aspect-auto lg:min-h-140">
            {look.coverImagePublicId ? (
              <StorageImage
                src={look.coverImagePublicId}
                blurDataUrl={look.coverImageBlurDataUrl ?? undefined}
                alt={look.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <Badge variant="outline" className="mb-3 text-xs">
                Editorial Look
              </Badge>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl">
                {look.name}
              </h1>
              {look.description && (
                <p className="mt-3 text-muted-foreground">{look.description}</p>
              )}
            </div>

            <Separator />

            {/* Item thumbnails */}
            {look.items.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-medium">
                  {look.items.length} piece{look.items.length !== 1 ? "s" : ""}{" "}
                  in this look
                </p>
                <div className="flex flex-wrap gap-2">
                  {look.items.map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-12 overflow-hidden rounded-lg border bg-muted"
                    >
                      <StorageImage
                        src={item.imagePublicId}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalPrice > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total look value
                </p>
                <p className="text-2xl font-semibold">
                  {formatPrice(totalPrice, "KES")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        {look.items.length > 0 && (
          <section className="mt-16" aria-label="Products in this look">
            <h2 className="font-heading text-xl font-bold mb-6 sm:text-2xl">
              Shop the Look
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {look.items.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
