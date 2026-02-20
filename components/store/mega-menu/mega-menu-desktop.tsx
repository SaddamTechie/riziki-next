"use client";

/**
 * Desktop Mega Menu — appears on category hover.
 * Fetches menu data from /api/mega-menu?dept=... based on active department.
 * Image items render as editorial cards; text items render as plain links.
 */

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useDepartmentStore } from "@/stores/department.store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StorageImage } from "@/components/shared/storage-image";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
    staleTime: 1000 * 60 * 60, // 1 hour — matches server cache
  });

  const handleMouseEnter = useCallback((sectionId: string) => {
    clearTimeout(closeTimer.current);
    setOpenSection(sectionId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenSection(null), 150);
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    );
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {sections.map((section) => (
          <li key={section.id} className="relative">
            <button
              onMouseEnter={() => handleMouseEnter(section.id)}
              onMouseLeave={handleMouseLeave}
              onFocus={() => handleMouseEnter(section.id)}
              onBlur={handleMouseLeave}
              aria-expanded={openSection === section.id}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium",
                "rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {section.label}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  openSection === section.id && "rotate-180",
                )}
              />
            </button>

            {/* Mega panel */}
            {openSection === section.id && section.items.length > 0 && (
              <div
                onMouseEnter={() => handleMouseEnter(section.id)}
                onMouseLeave={handleMouseLeave}
                className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
              >
                <div className="rounded-lg border bg-background p-6 shadow-xl">
                  <div className="grid auto-cols-fr grid-flow-col gap-8">
                    {/* Text links column */}
                    <ul className="flex min-w-[140px] flex-col gap-2">
                      {section.items
                        .filter((item) => !item.imageUrl && !item.imagePublicId)
                        .map((item) => (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                              onClick={() => setOpenSection(null)}
                            >
                              {item.label}
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[10px]"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        ))}
                    </ul>

                    {/* Editorial image cards */}
                    {section.items
                      .filter((item) => item.imageUrl || item.imagePublicId)
                      .map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group block w-40"
                          onClick={() => setOpenSection(null)}
                        >
                          <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-md bg-muted">
                            <StorageImage
                              src={item.imagePublicId ?? item.imageUrl!}
                              blurDataUrl={item.imageBlurDataUrl ?? undefined}
                              alt={item.label}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="160px"
                            />
                            {item.badge && (
                              <Badge className="absolute left-2 top-2 text-[10px]">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium transition-colors group-hover:text-muted-foreground">
                            {item.label}
                          </p>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
