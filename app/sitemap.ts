import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products, looks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.riziki.co.ke";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productRows, lookRows] = await Promise.all([
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true)),
    db.select({ slug: looks.slug }).from(looks).where(eq(looks.isActive, true)),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    // Department homepages
    {
      url: `${BASE_URL}/men`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Product listings
    {
      url: `${BASE_URL}/men/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/looks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // Info pages
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const productPages: MetadataRoute.Sitemap = productRows.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const lookPages: MetadataRoute.Sitemap = lookRows.map((l) => ({
    url: `${BASE_URL}/looks/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...lookPages];
}
