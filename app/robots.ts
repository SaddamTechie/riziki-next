import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.riziki.co.ke";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/admin/", "/api/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
