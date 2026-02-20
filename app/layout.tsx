import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

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

export const metadata: Metadata = {
  title: {
    default: "Riziki — Fashion",
    template: "%s | Riziki",
  },
  description: "Discover the latest fashion trends at Riziki.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
};

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
