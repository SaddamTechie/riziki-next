import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Common wrapper for static info pages (Delivery, Returns, Privacy, etc.)
 * Renders a centred prose container with a consistent header.
 */
export function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        <Separator className="mt-6" />
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </div>
  );
}
