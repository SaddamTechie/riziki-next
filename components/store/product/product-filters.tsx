"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multi?: boolean;
}

interface ProductFiltersProps {
  groups: FilterGroup[];
  /** Total products after filtering */
  total: number;
}

// ─── Hook: URL-synced filters ────────────────────────────────────────────────

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Read a filter value from URL (multi: returns array, single: returns string) */
  const getFilter = useCallback(
    (key: string, multi = false): string | string[] => {
      if (multi) return searchParams.getAll(key);
      return searchParams.get(key) ?? "";
    },
    [searchParams],
  );

  /** Count total active filter params (excluding sort/page/q) */
  const activeCount = useCallback(() => {
    const skip = new Set(["sort", "page", "q", "department"]);
    let count = 0;
    for (const [k] of searchParams.entries()) {
      if (!skip.has(k)) count++;
    }
    return count;
  }, [searchParams]);

  const setFilter = useCallback(
    (key: string, value: string, multi = false) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page"); // reset pagination
      if (multi) {
        const existing = params.getAll(key);
        if (existing.includes(value)) {
          params.delete(key);
          existing
            .filter((v) => v !== value)
            .forEach((v) => params.append(key, v));
        } else {
          params.append(key, value);
        }
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      if (value) {
        const existing = params.getAll(key);
        params.delete(key);
        existing
          .filter((v) => v !== value)
          .forEach((v) => params.append(key, v));
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    // Keep sort + department + q
    const keep = ["sort", "department", "q"];
    keep.forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return { getFilter, setFilter, removeFilter, clearFilters, activeCount };
}

// ─── Filter chips (inline row above grid) ────────────────────────────────────

interface ActiveChipsProps {
  groups: FilterGroup[];
}

export function ActiveFilterChips({ groups }: ActiveChipsProps) {
  const { getFilter, removeFilter, clearFilters, activeCount } =
    useProductFilters();
  const count = activeCount();
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      <span className="text-xs text-muted-foreground font-medium">
        Filters:
      </span>
      {groups.map((group) => {
        const active = group.multi
          ? (getFilter(group.id, true) as string[])
          : getFilter(group.id) !== ""
            ? [getFilter(group.id) as string]
            : [];

        return active.map((val) => {
          const label =
            group.options.find((o) => o.value === val)?.label ?? val;
          return (
            <button
              key={`${group.id}-${val}`}
              className="inline-flex items-center gap-1 rounded-full border bg-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/80"
              onClick={() => removeFilter(group.id, val)}
            >
              {label}
              <X className="h-3 w-3" />
            </button>
          );
        });
      })}
      <button
        className="text-xs text-muted-foreground underline hover:text-foreground"
        onClick={clearFilters}
      >
        Clear all
      </button>
    </div>
  );
}

// ─── Filter panel (used both in sheet + sidebar) ──────────────────────────────

function FilterPanel({ groups }: { groups: FilterGroup[] }) {
  const { getFilter, setFilter } = useProductFilters();

  return (
    <div className="space-y-6">
      {groups.map((group, idx) => {
        const active = group.multi
          ? (getFilter(group.id, true) as string[])
          : [getFilter(group.id) as string];

        return (
          <div key={group.id}>
            {idx > 0 && <Separator className="mb-6" />}
            <h3 className="mb-3 text-sm font-semibold">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const isActive = active.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(group.id, opt.value, group.multi)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-input hover:border-foreground",
                    )}
                  >
                    {opt.label}
                    {opt.count !== undefined && (
                      <span className="ml-1 opacity-60">({opt.count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component (mobile sheet + desktop sticky sidebar layout wrapper) ────

export function ProductFilters({ groups, total }: ProductFiltersProps) {
  const { activeCount } = useProductFilters();
  const count = activeCount();

  return (
    <>
      {/* Mobile filter trigger */}
      <div className="flex items-center justify-between lg:hidden">
        <p className="text-sm text-muted-foreground">{total} items</p>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {count > 0 && (
                <Badge
                  variant="destructive"
                  className="h-4 min-w-4 px-1 text-[10px]"
                >
                  {count}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterPanel groups={groups} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filters</h2>
            {count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {count} active
              </Badge>
            )}
          </div>
          <FilterPanel groups={groups} />
        </div>
      </aside>
    </>
  );
}
