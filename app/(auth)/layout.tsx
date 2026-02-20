/**
 * Auth layout — minimal, centered card with logo.
 */

import Link from "next/link";
import { getSiteConfig } from "@/lib/config/site";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link
        href="/"
        className="mb-8 font-heading text-2xl font-semibold tracking-tight"
      >
        {config.siteName}
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
