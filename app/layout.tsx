import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { getSiteConfig } from "@/lib/config/site";

// ─── Typography configuration ───────────────────────────────────────────────
// To swap fonts for the entire app, change ONLY these two imports + configs.
// Every component inherits via CSS variables --font-heading and --font-sans.

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-var",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const uiFont = Nunito({
  subsets: ["latin"],
  variable: "--font-ui-var",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
// ────────────────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const name = config.siteName;
  return {
    title: {
      default: `${name} — Fashion`,
      template: `%s | ${name}`,
    },
    description:
      config.seoDescription || `Discover the latest fashion trends at ${name}.`,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    ),
    openGraph: {
      siteName: name,
      images: [{ url: "/logo.png", alt: name }],
    },
    twitter: {
      card: "summary",
      images: ["/logo.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${uiFont.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
