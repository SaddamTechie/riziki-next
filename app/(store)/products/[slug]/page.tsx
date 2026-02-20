import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  looks,
  lookItems,
  categories as categoriesTable,
} from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { ProductImageGallery } from "@/components/store/product/product-image-gallery";
import { VariantPicker } from "@/components/store/product/variant-picker";
import { ProductCard } from "@/components/store/product/product-card";
import { BuyTheLookSection } from "@/components/store/looks/buy-the-look-section";
import { RecentlyViewed } from "@/components/store/product/recently-viewed";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { getSiteConfig } from "@/lib/config/site";
import { getOgImageUrl } from "@/lib/utils";
import { env } from "@/lib/env";

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getProduct(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);

  if (!product) return null;

  const [images, variants, category] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.sortOrder),
    db
      .select()
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, product.id),
          eq(productVariants.isActive, true),
        ),
      )
      .orderBy(productVariants.size),
    db
      .select({ name: categoriesTable.name, slug: categoriesTable.slug })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, product.categoryId))
      .limit(1),
  ]);

  return {
    ...product,
    price: parseFloat(product.price ?? "0"),
    compareAtPrice: product.compareAtPrice
      ? parseFloat(product.compareAtPrice)
      : null,
    images,
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      price: parseFloat(v.price),
    })),
    category: category[0] ?? null,
  };
}

async function getRelatedLooks(productId: string) {
  const items = await db
    .select({ lookId: lookItems.lookId })
    .from(lookItems)
    .where(eq(lookItems.productId, productId));

  if (!items.length) return [];

  const lookData = await db
    .select()
    .from(looks)
    .where(and(eq(looks.isActive, true)))
    .limit(3);

  // Map to the shape BuyTheLookSection expects
  const allLookItems = await db
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
    );

  return lookData.map((look) => ({
    id: look.id,
    slug: look.slug,
    title: look.name,
    imagePublicId: look.coverImagePublicId ?? "",
    imageBlurDataUrl: look.coverImageBlurDataUrl,
    totalPrice: parseFloat(look.totalPrice ?? "0"),
    items: allLookItems
      .filter((i) => i.lookId === look.id)
      .map((i) => ({
        productId: i.productId,
        productSlug: i.productSlug,
        productName: i.productName,
        imagePublicId: i.imagePublicId ?? "",
        price: parseFloat(i.price ?? "0"),
      })),
  }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const config = await getSiteConfig();
  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];
  const ogImage = primaryImage?.publicId
    ? getOgImageUrl(
        primaryImage.publicId,
        env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      )
    : undefined;

  return {
    title: `${product.name} | ${config.siteName}`,
    description:
      product.description ?? `Shop ${product.name} at ${config.siteName}`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? undefined,
      images: ogImage ? [ogImage] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, config] = await Promise.all([
    getProduct(slug),
    getSiteConfig(),
  ]);

  if (!product) notFound();

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  const whatsappLink = buildProductWhatsAppLink(config.whatsappNumber ?? "", {
    productName: product.name,
    size: product.variants[0]?.size ?? "",
    color: product.variants[0]?.color ?? "",
    price: product.price.toFixed(2),
    currencySymbol: "KES",
    productUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/products/${product.slug}`,
  });

  const relatedLooks = await getRelatedLooks(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          {product.category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/products?category=${product.category.slug}`}
                >
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main layout: image + info */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: image gallery */}
        <ProductImageGallery
          images={product.images.map((img) => ({
            publicId: img.publicId,
            blurDataUrl: img.blurDataUrl,
            altText: img.alt,
            displayOrder: img.sortOrder,
          }))}
          productName={product.name}
        />

        {/* Right: product info */}
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div>
            {product.brand && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {product.brand}
              </p>
            )}
            <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2">
              {product.isNew && <Badge>New In</Badge>}
              {product.isSale && <Badge variant="destructive">Sale</Badge>}
            </div>
          </div>

          <Separator />

          {/* Variant picker (price, size, color, add to cart) */}
          <VariantPicker
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            basePrice={product.price}
            compareAtPrice={product.compareAtPrice}
            variants={product.variants}
            imagePublicId={primaryImage?.publicId ?? ""}
            imageBlurDataUrl={primaryImage?.blurDataUrl}
            whatsappLink={whatsappLink}
          />

          <Separator />

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-sm font-semibold mb-2">About this item</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buy the Look */}
      {relatedLooks.length > 0 && (
        <div className="mt-16">
          <BuyTheLookSection looks={relatedLooks} />
        </div>
      )}

      {/* Recently viewed */}
      <div className="mt-16">
        <Suspense fallback={null}>
          <RecentlyViewed
            currentProductId={product.id}
            currentProduct={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imagePublicId: primaryImage?.publicId ?? "",
              imageBlurDataUrl: primaryImage?.blurDataUrl,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
