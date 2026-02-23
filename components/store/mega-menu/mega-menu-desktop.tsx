"use client";

/**
 * Desktop Mega Menu — full-width editorial panel on category hover.
 *
 * Layout:
 *   Left 2/3  — section heading + flat link grid + "View all" cta
 *   Right 1/3 — tall editorial hero image (first image-item in the section)
 *
 * The panel is absolutely positioned relative to the sticky <header> element
 * (which is a positioning context), so it spans the full viewport width without
 * any changes to StoreHeader or MainNav.
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useDepartmentStore } from "@/stores/department.store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StorageImage } from "@/components/shared/storage-image";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight } from "lucide-react";

/**
 * Rewrite a DB-stored href like `/products?category=men-shoes` to
 * `/${dept}/products?category=men-shoes`, stripping any stale `department=`
 * query param so the URL segment takes precedence.
 */
function resolveMegaMenuHref(href: string, dept: string | null): string {
  if (!href.startsWith("/products")) return href;
  const [, search] = href.split("?");
  const params = new URLSearchParams(search ?? "");
  params.delete("department");
  const qs = params.toString();
  const base = dept ? `/${dept}/products` : "/products";
  return qs ? `${base}?${qs}` : base;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  imagePublicId: string | null;
  imageUrl: string | null;
  imageBlurDataUrl: string | null;
  badge: string | null;
  sortOrder: number;
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

export function MegaMenuDesktop() {
  const department = useDepartmentStore((s) => s.selected);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: sections = [], isLoading } = useQuery<MenuSection[]>({
    queryKey: ["mega-menu", department],
    queryFn: async () => {
      const res = await fetch(`/api/mega-menu?dept=${department ?? "all"}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const open = useCallback((id: string) => {
    clearTimeout(closeTimer.current);
    setOpenSection(id);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenSection(null), 150);
  }, []);

  const cancelClose = useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  const activeSection = sections.find((s) => s.id === openSection) ?? null;
  const heroItem =
    activeSection?.items.find((i) => i.imagePublicId || i.imageUrl) ?? null;
  const linkItems =
    activeSection?.items.filter((i) => !i.imagePublicId && !i.imageUrl) ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Nav tabs ─────────────────────────────────────────────────────── */}
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-0.5">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onMouseEnter={() => open(section.id)}
                onMouseLeave={scheduleClose}
                onFocus={() => open(section.id)}
                onBlur={scheduleClose}
                aria-expanded={openSection === section.id}
                aria-haspopup="true"
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  openSection === section.id &&
                    "bg-accent text-accent-foreground",
                )}
              >
                {section.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    openSection === section.id && "rotate-180",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Full-width panel ─────────────────────────────────────────────── */}
      {/* Positioned absolute relative to the sticky <header> (positioning  */}
      {/* context), so inset-x-0 = full viewport width regardless of where  */}
      {/* this component is in the flex layout.                              */}
      {openSection && activeSection && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={cn(
            "absolute inset-x-0 top-full z-50",
            "border-b bg-background shadow-2xl",
            "animate-in fade-in-0 slide-in-from-top-1 duration-150",
          )}
        >
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="grid grid-cols-3 gap-16">
              {/* ── Left: links ──────────────────────────────────────────── */}
              <div className="col-span-2">
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {activeSection.label}
                </p>

                {linkItems.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-x-10 gap-y-3 xl:grid-cols-3">
                    {linkItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={resolveMegaMenuHref(item.href, department)}
                          onClick={() => setOpenSection(null)}
                          className="group flex items-center gap-2 text-sm transition-colors"
                        >
                          <span className="text-foreground/75 underline-offset-4 group-hover:text-foreground group-hover:underline">
                            {item.label}
                          </span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px] font-medium"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No items yet.</p>
                )}

                <Link
                  href={department ? `/${department}/products` : "/products"}
                  onClick={() => setOpenSection(null)}
                  className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 hover:no-underline"
                >
                  View all {activeSection.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* ── Right: editorial hero ─────────────────────────────────── */}
              {heroItem ? (
                <Link
                  href={resolveMegaMenuHref(heroItem.href, department)}
                  onClick={() => setOpenSection(null)}
                  className="group relative block"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-muted">
                    <StorageImage
                      src={heroItem.imagePublicId ?? heroItem.imageUrl!}
                      blurDataUrl={heroItem.imageBlurDataUrl ?? undefined}
                      alt={heroItem.label}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 1280px) 28vw, 360px"
                      priority
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
                    {/* Label */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      {heroItem.badge && (
                        <Badge className="mb-2 text-[11px]">
                          {heroItem.badge}
                        </Badge>
                      )}
                      <p className="font-heading text-base font-semibold leading-snug text-white">
                        {heroItem.label}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-white/80 transition-colors group-hover:text-white">
                        Shop now
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                // placeholder when no hero image is configured
                <div className="flex aspect-3/4 w-full items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                  No hero image set
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
