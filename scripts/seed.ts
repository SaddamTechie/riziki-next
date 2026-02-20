/**
 * Database seeder — populates Riziki with realistic fake data for development.
 *
 * Run:  npm run seed
 *
 * Uses @faker-js/faker for data generation.
 * Images: picsum.photos (real photos, seed-stable URLs)
 * Safe to re-run: clears all seeded tables first.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load .env.local before anything else ───────────────────────────────────
function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), filePath), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local might not exist in CI — that's fine
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// ─── DB setup (bypasses server-only / env validation) ────────────────────────
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Check your .env.local file.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

// ─── Faker ───────────────────────────────────────────────────────────────────
import { faker } from "@faker-js/faker";
faker.seed(42); // reproducible

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const picsum = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;
const price = (min: number, max: number) =>
  Math.round((faker.number.float({ min, max }) / 100) * 100).toFixed(2);

// ─── Main seeder ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Riziki seeder starting...\n");

  // ── 1. Clear existing seeded data ─────────────────────────────────────────
  console.log("🗑   Clearing existing data...");
  await db.delete(schema.megaMenuItems);
  await db.delete(schema.megaMenuSections);
  await db.delete(schema.lookItems);
  await db.delete(schema.looks);
  await db.delete(schema.banners);
  await db.delete(schema.productVariants);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.siteConfig);
  console.log("   Done.\n");

  // ── 2. Site config ─────────────────────────────────────────────────────────
  console.log("⚙️   Seeding site config...");
  await db.insert(schema.siteConfig).values([
    { key: "site_name", value: "Riziki", type: "string" },
    {
      key: "site_tagline",
      value: "Fashion That Moves With You",
      type: "string",
    },
    { key: "primary_color", value: "#1a1a1a", type: "string" },
    { key: "whatsapp_number", value: "+254700000000", type: "string" },
    { key: "currency", value: "KES", type: "string" },
    { key: "currency_symbol", value: "KSh", type: "string" },
    {
      key: "seo_description",
      value:
        "Shop the latest fashion trends at Riziki — premium African fashion for women, men, and beauty.",
      type: "string",
    },
    {
      key: "active_departments",
      value: JSON.stringify(["women", "men", "beauty"]),
      type: "json",
    },
    { key: "logo_public_id", value: "", type: "string" },
    {
      key: "shipping_policy",
      value: "Free shipping on orders above KES 5,000.",
      type: "string",
    },
    {
      key: "returns_policy",
      value: "Free returns within 14 days of delivery.",
      type: "string",
    },
  ]);
  console.log("   Done.\n");

  // ── 3. Categories ──────────────────────────────────────────────────────────
  console.log("🗂   Seeding categories...");

  // Women top-level
  const wCatClothingId = uid();
  const wCatShoesId = uid();
  const wCatBagsId = uid();

  // Men top-level
  const mCatClothingId = uid();
  const mCatShoesId = uid();
  const mCatAccessoriesId = uid();

  // Beauty top-level
  const bCatSkincareId = uid();
  const bCatMakeupId = uid();
  const bCatHairId = uid();

  // Women sub-categories
  const wDressesId = uid();
  const wTopsId = uid();
  const wBottomsId = uid();

  // Men sub-categories
  const mTopsId = uid();
  const mBottomsId = uid();
  const mJacketsId = uid();

  await db.insert(schema.categories).values([
    // Women top-level
    {
      id: wCatClothingId,
      name: "Clothing",
      slug: "women-clothing",
      department: "women",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: wCatShoesId,
      name: "Shoes",
      slug: "women-shoes",
      department: "women",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: wCatBagsId,
      name: "Bags & Accessories",
      slug: "women-bags",
      department: "women",
      sortOrder: 3,
      isActive: true,
    },
    // Women sub
    {
      id: wDressesId,
      name: "Dresses & Jumpsuits",
      slug: "women-dresses",
      department: "women",
      parentId: wCatClothingId,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: wTopsId,
      name: "Tops & T-Shirts",
      slug: "women-tops",
      department: "women",
      parentId: wCatClothingId,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: wBottomsId,
      name: "Bottoms",
      slug: "women-bottoms",
      department: "women",
      parentId: wCatClothingId,
      sortOrder: 3,
      isActive: true,
    },
    // Men top-level
    {
      id: mCatClothingId,
      name: "Clothing",
      slug: "men-clothing",
      department: "men",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: mCatShoesId,
      name: "Shoes",
      slug: "men-shoes",
      department: "men",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: mCatAccessoriesId,
      name: "Accessories",
      slug: "men-accessories",
      department: "men",
      sortOrder: 3,
      isActive: true,
    },
    // Men sub
    {
      id: mTopsId,
      name: "Tops & Shirts",
      slug: "men-tops",
      department: "men",
      parentId: mCatClothingId,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: mBottomsId,
      name: "Bottoms & Jeans",
      slug: "men-bottoms",
      department: "men",
      parentId: mCatClothingId,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: mJacketsId,
      name: "Jackets & Coats",
      slug: "men-jackets",
      department: "men",
      parentId: mCatClothingId,
      sortOrder: 3,
      isActive: true,
    },
    // Beauty
    {
      id: bCatSkincareId,
      name: "Skincare",
      slug: "beauty-skincare",
      department: "beauty",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: bCatMakeupId,
      name: "Makeup",
      slug: "beauty-makeup",
      department: "beauty",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: bCatHairId,
      name: "Hair & Body",
      slug: "beauty-hair",
      department: "beauty",
      sortOrder: 3,
      isActive: true,
    },
  ]);
  console.log("   Done.\n");

  // ── 4. Products ────────────────────────────────────────────────────────────
  console.log("👗  Seeding products...");

  type ProductDef = {
    id: string;
    name: string;
    department: "women" | "men" | "beauty" | "all";
    categoryId: string;
    brand: string;
    price: string;
    compareAtPrice?: string;
    isNew?: boolean;
    isSale?: boolean;
    isFeatured?: boolean;
    tags: string[];
    sizes: string[];
    colors: { name: string; hex: string }[];
  };

  const WOMEN_BRANDS = ["Zara", "H&M", "ASOS", "Mango", "& Other Stories"];
  const MEN_BRANDS = ["Zara Man", "H&M", "ASOS", "Topman", "Pull&Bear"];
  const BEAUTY_BRANDS = [
    "The Ordinary",
    "Fenty Beauty",
    "Maybelline",
    "NARS",
    "CeraVe",
  ];

  const clothing_sizes = ["XS", "S", "M", "L", "XL"];
  const shoe_sizes_w = ["36", "37", "38", "39", "40", "41"];
  const shoe_sizes_m = ["40", "41", "42", "43", "44", "45"];
  const beauty_sizes = ["One Size"];

  const neutral_colors = [
    { name: "Black", hex: "#1a1a1a" },
    { name: "White", hex: "#ffffff" },
    { name: "Navy", hex: "#1c2b4b" },
  ];
  const warm_colors = [
    { name: "Camel", hex: "#c19a6b" },
    { name: "Terracotta", hex: "#c47c5a" },
    { name: "Cream", hex: "#f5f0e8" },
  ];
  const vibrant_colors = [
    { name: "Cobalt", hex: "#0047ab" },
    { name: "Emerald", hex: "#2e7d32" },
    { name: "Berry", hex: "#8b0057" },
  ];

  const products: ProductDef[] = [
    // ── Women
    {
      id: uid(),
      name: "Linen Wrap Dress",
      department: "women",
      categoryId: wDressesId,
      brand: WOMEN_BRANDS[0],
      price: price(3500, 5500),
      compareAtPrice: price(5600, 7000),
      isNew: true,
      isSale: true,
      isFeatured: true,
      tags: ["dress", "linen", "summer", "wrap"],
      sizes: clothing_sizes,
      colors: [neutral_colors[0], warm_colors[2]],
    },
    {
      id: uid(),
      name: "Satin Slip Dress",
      department: "women",
      categoryId: wDressesId,
      brand: WOMEN_BRANDS[2],
      price: price(2800, 4500),
      isNew: true,
      isFeatured: true,
      tags: ["dress", "satin", "evening", "slip"],
      sizes: clothing_sizes,
      colors: [neutral_colors[0], warm_colors[0], vibrant_colors[2]],
    },
    {
      id: uid(),
      name: "Floral Maxi Dress",
      department: "women",
      categoryId: wDressesId,
      brand: WOMEN_BRANDS[3],
      price: price(3000, 4800),
      compareAtPrice: price(5000, 6000),
      isSale: true,
      tags: ["dress", "floral", "maxi", "boho"],
      sizes: clothing_sizes,
      colors: [warm_colors[1], warm_colors[2]],
    },
    {
      id: uid(),
      name: "Ribbed Crop Top",
      department: "women",
      categoryId: wTopsId,
      brand: WOMEN_BRANDS[1],
      price: price(800, 1500),
      isNew: true,
      tags: ["top", "ribbed", "crop", "casual"],
      sizes: clothing_sizes,
      colors: neutral_colors,
    },
    {
      id: uid(),
      name: "Oversized Blazer",
      department: "women",
      categoryId: wTopsId,
      brand: WOMEN_BRANDS[4],
      price: price(5500, 8500),
      compareAtPrice: price(9000, 11000),
      isFeatured: true,
      isSale: true,
      tags: ["blazer", "oversized", "office", "tailored"],
      sizes: clothing_sizes,
      colors: [neutral_colors[0], neutral_colors[2], warm_colors[0]],
    },
    {
      id: uid(),
      name: "High-Rise Wide Leg Jeans",
      department: "women",
      categoryId: wBottomsId,
      brand: WOMEN_BRANDS[0],
      price: price(3500, 5000),
      isNew: true,
      isFeatured: true,
      tags: ["jeans", "denim", "wide-leg", "high-rise"],
      sizes: ["24", "25", "26", "27", "28", "29", "30"],
      colors: [
        { name: "Indigo", hex: "#3f5673" },
        { name: "Light Wash", hex: "#9fb3c8" },
      ],
    },
    {
      id: uid(),
      name: "Satin Mini Skirt",
      department: "women",
      categoryId: wBottomsId,
      brand: WOMEN_BRANDS[2],
      price: price(1800, 2800),
      compareAtPrice: price(3000, 3500),
      isSale: true,
      tags: ["skirt", "mini", "satin", "going-out"],
      sizes: clothing_sizes,
      colors: [neutral_colors[0], vibrant_colors[2], warm_colors[0]],
    },
    {
      id: uid(),
      name: "Strappy Block Heel Sandals",
      department: "women",
      categoryId: wCatShoesId,
      brand: WOMEN_BRANDS[3],
      price: price(3500, 6000),
      isFeatured: true,
      tags: ["shoes", "heels", "sandals", "strappy"],
      sizes: shoe_sizes_w,
      colors: [neutral_colors[0], warm_colors[0]],
    },
    {
      id: uid(),
      name: "White Leather Sneakers",
      department: "women",
      categoryId: wCatShoesId,
      brand: WOMEN_BRANDS[0],
      price: price(4500, 7000),
      isNew: true,
      isFeatured: true,
      tags: ["shoes", "sneakers", "leather", "casual"],
      sizes: shoe_sizes_w,
      colors: [neutral_colors[1]],
    },
    {
      id: uid(),
      name: "Mini Leather Tote",
      department: "women",
      categoryId: wCatBagsId,
      brand: WOMEN_BRANDS[4],
      price: price(6000, 10000),
      compareAtPrice: price(11000, 14000),
      isFeatured: true,
      isSale: true,
      tags: ["bag", "tote", "leather", "mini"],
      sizes: beauty_sizes,
      colors: [neutral_colors[0], warm_colors[0], warm_colors[2]],
    },

    // ── Men
    {
      id: uid(),
      name: "Essential Cotton Tee",
      department: "men",
      categoryId: mTopsId,
      brand: MEN_BRANDS[1],
      price: price(800, 1500),
      isNew: true,
      tags: ["tshirt", "cotton", "essential", "basic"],
      sizes: clothing_sizes,
      colors: neutral_colors,
    },
    {
      id: uid(),
      name: "Linen Short Sleeve Shirt",
      department: "men",
      categoryId: mTopsId,
      brand: MEN_BRANDS[0],
      price: price(2200, 3500),
      isNew: true,
      isFeatured: true,
      tags: ["shirt", "linen", "summer", "casual"],
      sizes: clothing_sizes,
      colors: [
        neutral_colors[1],
        warm_colors[2],
        { name: "Sage", hex: "#9caf88" },
      ],
    },
    {
      id: uid(),
      name: "Tailored Blazer",
      department: "men",
      categoryId: mJacketsId,
      brand: MEN_BRANDS[0],
      price: price(7000, 11000),
      compareAtPrice: price(12000, 15000),
      isFeatured: true,
      isSale: true,
      tags: ["blazer", "tailored", "office", "smart"],
      sizes: clothing_sizes,
      colors: [neutral_colors[0], neutral_colors[2]],
    },
    {
      id: uid(),
      name: "Slim Fit Chinos",
      department: "men",
      categoryId: mBottomsId,
      brand: MEN_BRANDS[4],
      price: price(2500, 4000),
      isFeatured: true,
      tags: ["chinos", "slim", "casual", "trousers"],
      sizes: ["28", "30", "32", "34", "36"],
      colors: [
        { name: "Khaki", hex: "#c3b091" },
        neutral_colors[2],
        neutral_colors[0],
      ],
    },
    {
      id: uid(),
      name: "Straight Denim Jeans",
      department: "men",
      categoryId: mBottomsId,
      brand: MEN_BRANDS[2],
      price: price(3000, 5000),
      compareAtPrice: price(5500, 6500),
      isSale: true,
      tags: ["jeans", "denim", "straight", "casual"],
      sizes: ["28", "30", "32", "34", "36"],
      colors: [
        { name: "Dark Wash", hex: "#2c3e50" },
        { name: "Mid Wash", hex: "#5d7a9a" },
      ],
    },
    {
      id: uid(),
      name: "Leather Derby Shoes",
      department: "men",
      categoryId: mCatShoesId,
      brand: MEN_BRANDS[0],
      price: price(7500, 12000),
      isFeatured: true,
      isNew: true,
      tags: ["shoes", "leather", "formal", "derby"],
      sizes: shoe_sizes_m,
      colors: [neutral_colors[0], { name: "Tan", hex: "#a0785a" }],
    },
    {
      id: uid(),
      name: "Chunky Sole Sneakers",
      department: "men",
      categoryId: mCatShoesId,
      brand: MEN_BRANDS[2],
      price: price(5000, 8000),
      compareAtPrice: price(9000, 10000),
      isSale: true,
      isNew: true,
      tags: ["sneakers", "chunky", "streetwear", "trainers"],
      sizes: shoe_sizes_m,
      colors: [neutral_colors[0], neutral_colors[1]],
    },
    {
      id: uid(),
      name: "Canvas Weekend Bag",
      department: "men",
      categoryId: mCatAccessoriesId,
      brand: MEN_BRANDS[2],
      price: price(3500, 5500),
      isFeatured: true,
      tags: ["bag", "canvas", "weekend", "duffel"],
      sizes: beauty_sizes,
      colors: [neutral_colors[2], { name: "Olive", hex: "#556b2f" }],
    },

    // ── Beauty
    {
      id: uid(),
      name: "Vitamin C Brightening Serum",
      department: "beauty",
      categoryId: bCatSkincareId,
      brand: BEAUTY_BRANDS[0],
      price: price(1500, 3000),
      isNew: true,
      isFeatured: true,
      tags: ["serum", "vitamin-c", "brightening", "skincare"],
      sizes: beauty_sizes,
      colors: [{ name: "30ml", hex: "#f5a623" }],
    },
    {
      id: uid(),
      name: "Hydrating SPF 50 Sunscreen",
      department: "beauty",
      categoryId: bCatSkincareId,
      brand: BEAUTY_BRANDS[4],
      price: price(1200, 2200),
      compareAtPrice: price(2500, 3000),
      isSale: true,
      tags: ["sunscreen", "spf", "hydrating", "protection"],
      sizes: beauty_sizes,
      colors: [{ name: "50ml", hex: "#e8f4fd" }],
    },
    {
      id: uid(),
      name: "Matte Liquid Lipstick",
      department: "beauty",
      categoryId: bCatMakeupId,
      brand: BEAUTY_BRANDS[1],
      price: price(800, 1800),
      isNew: true,
      isFeatured: true,
      tags: ["lipstick", "matte", "lip", "makeup"],
      sizes: beauty_sizes,
      colors: [
        { name: "Ruby Red", hex: "#9b1919" },
        { name: "Nude Blush", hex: "#c68b77" },
        { name: "Rosewood", hex: "#8b4558" },
      ],
    },
    {
      id: uid(),
      name: "Volumizing Mascara",
      department: "beauty",
      categoryId: bCatMakeupId,
      brand: BEAUTY_BRANDS[2],
      price: price(700, 1500),
      tags: ["mascara", "volumizing", "eyes", "makeup"],
      sizes: beauty_sizes,
      colors: [{ name: "Blackest Black", hex: "#0a0a0a" }],
    },
    {
      id: uid(),
      name: "Argan Hair Oil",
      department: "beauty",
      categoryId: bCatHairId,
      brand: BEAUTY_BRANDS[3],
      price: price(1200, 2500),
      isFeatured: true,
      isNew: true,
      tags: ["hair", "argan", "oil", "treatment"],
      sizes: beauty_sizes,
      colors: [{ name: "100ml", hex: "#d4a017" }],
    },
    {
      id: uid(),
      name: "Deep Repair Hair Mask",
      department: "beauty",
      categoryId: bCatHairId,
      brand: BEAUTY_BRANDS[2],
      price: price(900, 1800),
      compareAtPrice: price(2000, 2500),
      isSale: true,
      tags: ["hair", "mask", "repair", "treatment"],
      sizes: beauty_sizes,
      colors: [{ name: "300ml", hex: "#f0e6d3" }],
    },
  ];

  // Insert products + images + variants
  for (const p of products) {
    const productSlug = slug(p.name);
    await db.insert(schema.products).values({
      id: p.id,
      name: p.name,
      slug: productSlug,
      description: faker.commerce.productDescription(),
      categoryId: p.categoryId,
      department: p.department,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      brand: p.brand,
      isNew: p.isNew ?? false,
      isSale: p.isSale ?? false,
      isActive: true,
      isFeatured: p.isFeatured ?? false,
      sortOrder: 0,
      tags: p.tags,
    });

    // 2 images per product
    const imgIds = [uid(), uid()];
    for (let i = 0; i < 2; i++) {
      const imgSeed = `${productSlug}-${i}`;
      await db.insert(schema.productImages).values({
        id: imgIds[i],
        productId: p.id,
        publicId: picsum(imgSeed),
        url: picsum(imgSeed),
        alt: `${p.name} — view ${i + 1}`,
        isPrimary: i === 0,
        sortOrder: i,
      });
    }

    // Variants: each size × each color
    for (const size of p.sizes) {
      for (const color of p.colors) {
        const basePrice = parseFloat(p.price);
        const compareAt = p.compareAtPrice
          ? parseFloat(p.compareAtPrice)
          : null;
        await db.insert(schema.productVariants).values({
          id: uid(),
          productId: p.id,
          size,
          color: color.name,
          colorHex: color.hex,
          sku: `${productSlug}-${size}-${slug(color.name)}`.toUpperCase(),
          price: basePrice.toFixed(2),
          compareAtPrice: compareAt ? compareAt.toFixed(2) : null,
          stock: faker.number.int({ min: 0, max: 50 }),
          isActive: true,
        });
      }
    }
  }
  console.log(`   Inserted ${products.length} products.\n`);

  // ── 5. Banners ─────────────────────────────────────────────────────────────
  console.log("🖼   Seeding banners...");
  await db.insert(schema.banners).values([
    {
      id: uid(),
      title: "New Season, New You",
      subtitle: "Discover the latest women's collection",
      ctaLabel: "Shop Women",
      ctaHref: "/products?department=women",
      department: "women",
      type: "hero",
      imagePublicId: picsum("banner-women", 1440, 600),
      imageUrl: picsum("banner-women", 1440, 600),
      textTheme: "light",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: uid(),
      title: "Elevated Basics",
      subtitle: "Refined essentials for the modern man",
      ctaLabel: "Shop Men",
      ctaHref: "/products?department=men",
      department: "men",
      type: "hero",
      imagePublicId: picsum("banner-men", 1440, 600),
      imageUrl: picsum("banner-men", 1440, 600),
      textTheme: "light",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: uid(),
      title: "Beauty Essentials",
      subtitle: "Your daily glow routine starts here",
      ctaLabel: "Shop Beauty",
      ctaHref: "/products?department=beauty",
      department: "beauty",
      type: "hero",
      imagePublicId: picsum("banner-beauty", 1440, 600),
      imageUrl: picsum("banner-beauty", 1440, 600),
      textTheme: "light",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: uid(),
      title: "End of Season Sale — Up to 50% Off",
      subtitle: "Limited time only",
      ctaLabel: "Shop the Sale",
      ctaHref: "/products?sale=true",
      department: "all",
      type: "hero",
      imagePublicId: picsum("banner-sale", 1440, 600),
      imageUrl: picsum("banner-sale", 1440, 600),
      textTheme: "light",
      isActive: true,
      sortOrder: 2,
    },
  ]);
  console.log("   Done.\n");

  // ── 6. Looks ───────────────────────────────────────────────────────────────
  console.log("✨  Seeding Buy the Look...");

  // Pick a few product IDs from the inserted products
  const womenProducts = products.filter((p) => p.department === "women");
  const menProducts = products.filter((p) => p.department === "men");

  const look1Id = uid();
  const look2Id = uid();
  const look3Id = uid();

  await db.insert(schema.looks).values([
    {
      id: look1Id,
      name: "Summer Edit",
      slug: "summer-edit",
      description: "Head-to-toe summer essentials for the modern woman.",
      coverImagePublicId: picsum("look-summer", 600, 800),
      coverImageUrl: picsum("look-summer", 600, 800),
      totalPrice: (
        parseFloat(womenProducts[0].price) +
        parseFloat(womenProducts[3].price) +
        parseFloat(womenProducts[7].price)
      ).toFixed(2),
      department: "women",
      isActive: true,
      sortOrder: 1,
    },
    {
      id: look2Id,
      name: "Office Ready",
      slug: "office-ready",
      description: "Smart casual looks for the modern professional.",
      coverImagePublicId: picsum("look-office", 600, 800),
      coverImageUrl: picsum("look-office", 600, 800),
      totalPrice: (
        parseFloat(menProducts[1].price) +
        parseFloat(menProducts[3].price) +
        parseFloat(menProducts[5].price)
      ).toFixed(2),
      department: "men",
      isActive: true,
      sortOrder: 2,
    },
    {
      id: look3Id,
      name: "Evening Glam",
      slug: "evening-glam",
      description: "Make a statement with this curated evening look.",
      coverImagePublicId: picsum("look-evening", 600, 800),
      coverImageUrl: picsum("look-evening", 600, 800),
      totalPrice: (
        parseFloat(womenProducts[1].price) +
        parseFloat(womenProducts[4].price) +
        parseFloat(womenProducts[9].price)
      ).toFixed(2),
      department: "women",
      isActive: true,
      sortOrder: 3,
    },
  ]);

  await db.insert(schema.lookItems).values([
    // Summer Edit
    {
      id: uid(),
      lookId: look1Id,
      productId: womenProducts[0].id,
      sortOrder: 1,
    },
    {
      id: uid(),
      lookId: look1Id,
      productId: womenProducts[3].id,
      sortOrder: 2,
    },
    {
      id: uid(),
      lookId: look1Id,
      productId: womenProducts[7].id,
      sortOrder: 3,
    },
    // Office Ready
    { id: uid(), lookId: look2Id, productId: menProducts[1].id, sortOrder: 1 },
    { id: uid(), lookId: look2Id, productId: menProducts[3].id, sortOrder: 2 },
    { id: uid(), lookId: look2Id, productId: menProducts[5].id, sortOrder: 3 },
    // Evening Glam
    {
      id: uid(),
      lookId: look3Id,
      productId: womenProducts[1].id,
      sortOrder: 1,
    },
    {
      id: uid(),
      lookId: look3Id,
      productId: womenProducts[4].id,
      sortOrder: 2,
    },
    {
      id: uid(),
      lookId: look3Id,
      productId: womenProducts[9].id,
      sortOrder: 3,
    },
  ]);
  console.log("   Done.\n");

  // ── 7. Mega Menu ───────────────────────────────────────────────────────────
  console.log("🗺   Seeding mega menu...");
  const sections = [
    // Women
    { dept: "women" as const, label: "New In", sortOrder: 1 },
    { dept: "women" as const, label: "Clothing", sortOrder: 2 },
    { dept: "women" as const, label: "Shoes & Bags", sortOrder: 3 },
    // Men
    { dept: "men" as const, label: "New In", sortOrder: 1 },
    { dept: "men" as const, label: "Clothing", sortOrder: 2 },
    { dept: "men" as const, label: "Shoes", sortOrder: 3 },
    // Beauty
    { dept: "beauty" as const, label: "Skincare", sortOrder: 1 },
    { dept: "beauty" as const, label: "Makeup", sortOrder: 2 },
    { dept: "beauty" as const, label: "Hair & Body", sortOrder: 3 },
  ];

  const menuItems: {
    label: string;
    href: string;
    badge?: string;
    sectionLabel: string;
    dept: "women" | "men" | "beauty";
    sortOrder: number;
  }[] = [
    // Women — New In
    {
      sectionLabel: "New In",
      dept: "women",
      label: "New Arrivals",
      href: "/products?department=women&sort=newest",
      badge: "NEW",
      sortOrder: 1,
    },
    {
      sectionLabel: "New In",
      dept: "women",
      label: "Best Sellers",
      href: "/products?department=women&sort=popular",
      sortOrder: 2,
    },
    {
      sectionLabel: "New In",
      dept: "women",
      label: "Sale",
      href: "/products?department=women&sale=true",
      badge: "SALE",
      sortOrder: 3,
    },
    // Women — Clothing
    {
      sectionLabel: "Clothing",
      dept: "women",
      label: "Dresses & Jumpsuits",
      href: "/products?category=women-dresses",
      sortOrder: 1,
    },
    {
      sectionLabel: "Clothing",
      dept: "women",
      label: "Tops & T-Shirts",
      href: "/products?category=women-tops",
      sortOrder: 2,
    },
    {
      sectionLabel: "Clothing",
      dept: "women",
      label: "Bottoms",
      href: "/products?category=women-bottoms",
      sortOrder: 3,
    },
    {
      sectionLabel: "Clothing",
      dept: "women",
      label: "View All Clothing",
      href: "/products?category=women-clothing",
      sortOrder: 4,
    },
    // Women — Shoes & Bags
    {
      sectionLabel: "Shoes & Bags",
      dept: "women",
      label: "Shoes",
      href: "/products?category=women-shoes",
      sortOrder: 1,
    },
    {
      sectionLabel: "Shoes & Bags",
      dept: "women",
      label: "Bags & Accessories",
      href: "/products?category=women-bags",
      sortOrder: 2,
    },
    // Men — New In
    {
      sectionLabel: "New In",
      dept: "men",
      label: "New Arrivals",
      href: "/products?department=men&sort=newest",
      badge: "NEW",
      sortOrder: 1,
    },
    {
      sectionLabel: "New In",
      dept: "men",
      label: "Back in Stock",
      href: "/products?department=men&sort=popular",
      sortOrder: 2,
    },
    {
      sectionLabel: "New In",
      dept: "men",
      label: "Sale",
      href: "/products?department=men&sale=true",
      badge: "SALE",
      sortOrder: 3,
    },
    // Men — Clothing
    {
      sectionLabel: "Clothing",
      dept: "men",
      label: "Tops & Shirts",
      href: "/products?category=men-tops",
      sortOrder: 1,
    },
    {
      sectionLabel: "Clothing",
      dept: "men",
      label: "Bottoms & Jeans",
      href: "/products?category=men-bottoms",
      sortOrder: 2,
    },
    {
      sectionLabel: "Clothing",
      dept: "men",
      label: "Jackets & Coats",
      href: "/products?category=men-jackets",
      sortOrder: 3,
    },
    // Men — Shoes
    {
      sectionLabel: "Shoes",
      dept: "men",
      label: "Sneakers & Trainers",
      href: "/products?category=men-shoes",
      sortOrder: 1,
    },
    {
      sectionLabel: "Shoes",
      dept: "men",
      label: "Formal Shoes",
      href: "/products?category=men-shoes&sort=newest",
      sortOrder: 2,
    },
    {
      sectionLabel: "Shoes",
      dept: "men",
      label: "Accessories",
      href: "/products?category=men-accessories",
      sortOrder: 3,
    },
    // Beauty — Skincare
    {
      sectionLabel: "Skincare",
      dept: "beauty",
      label: "Serums",
      href: "/products?category=beauty-skincare&sort=newest",
      sortOrder: 1,
    },
    {
      sectionLabel: "Skincare",
      dept: "beauty",
      label: "Moisturisers",
      href: "/products?category=beauty-skincare",
      sortOrder: 2,
    },
    {
      sectionLabel: "Skincare",
      dept: "beauty",
      label: "SPF & Protection",
      href: "/products?category=beauty-skincare&sort=popular",
      sortOrder: 3,
    },
    // Beauty — Makeup
    {
      sectionLabel: "Makeup",
      dept: "beauty",
      label: "Lips",
      href: "/products?category=beauty-makeup",
      sortOrder: 1,
    },
    {
      sectionLabel: "Makeup",
      dept: "beauty",
      label: "Eyes",
      href: "/products?category=beauty-makeup&sort=newest",
      sortOrder: 2,
    },
    {
      sectionLabel: "Makeup",
      dept: "beauty",
      label: "Face",
      href: "/products?category=beauty-makeup&sort=popular",
      sortOrder: 3,
    },
    // Beauty — Hair
    {
      sectionLabel: "Hair & Body",
      dept: "beauty",
      label: "Hair Treatments",
      href: "/products?category=beauty-hair",
      sortOrder: 1,
    },
    {
      sectionLabel: "Hair & Body",
      dept: "beauty",
      label: "Styling",
      href: "/products?category=beauty-hair&sort=newest",
      sortOrder: 2,
    },
  ];

  // Insert sections and map labels → IDs
  const sectionIdMap = new Map<string, string>();
  for (const s of sections) {
    const id = uid();
    sectionIdMap.set(`${s.dept}:${s.label}`, id);
    await db.insert(schema.megaMenuSections).values({
      id,
      department: s.dept,
      label: s.label,
      sortOrder: s.sortOrder,
      isActive: true,
    });
  }

  for (const item of menuItems) {
    const sectionId = sectionIdMap.get(`${item.dept}:${item.sectionLabel}`);
    if (!sectionId) continue;
    await db.insert(schema.megaMenuItems).values({
      id: uid(),
      sectionId,
      label: item.label,
      href: item.href,
      badge: item.badge ?? null,
      sortOrder: item.sortOrder,
      isActive: true,
    });
  }
  console.log("   Done.\n");

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("✅  Seeding complete!");
  console.log(`   • ${products.length} products with images and variants`);
  console.log(
    `   • ${(await db.select().from(schema.productVariants)).length} variants`,
  );
  console.log("   • 4 hero banners");
  console.log("   • 3 Buy the Look sets");
  console.log("   • Full mega menu for Women, Men, Beauty\n");
  console.log('   Run "npm run dev" and open http://localhost:3000 🚀\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seeder failed:", err);
  process.exit(1);
});
