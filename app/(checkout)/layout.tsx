/**
 * Checkout layout — distraction-free.
 * No main nav, no footer distractions. Just logo + secure badge.
 */

import Link from "next/link";
import { getSiteConfig } from "@/lib/config/site";
import { ShieldCheck } from "lucide-react";

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal checkout header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-heading text-xl font-semibold tracking-tight"
          >
            {config.siteName}
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Secure Checkout
          </span>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
