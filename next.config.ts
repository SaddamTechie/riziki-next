import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Partial Prerendering (PPR) ───────────────────────────────────────────
  // `experimental.ppr` was merged into `cacheComponents` in Next.js 16
  cacheComponents: true,

  // ─── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    // Improve server component performance
    inlineCss: true,
  },

  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    // Use custom loader from storage abstraction — see lib/storage/index.ts
    loader: "custom",
    loaderFile: "./lib/storage/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Fallback domains (direct Cloudinary URLs during dev)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Seed/dev placeholder images
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // ─── Headers ──────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
