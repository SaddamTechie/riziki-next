"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/store/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Masonry-style virtual product grid.
 *
 * Uses CSS columns for the masonry layout + @tanstack/react-virtual for
 * overscan to avoid mounting thousands of cards at once.
 *
 * For simplicity we use a 2-D row partition: items are split into rows of
 * `columns` items each. Only visible rows are rendered.
 */

interface ProductGridProps {
  products: ProductCardData[];
  isLoading?: boolean;
  /** Number of columns — from the parent via CSS or a hook */
  columns?: number;
}

function getColumns(): number {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < 640) return 2;
  if (w < 1024) return 3;
  return 4;
}

export function VirtualProductGrid({
  products,
  isLoading,
  columns: columnsProp,
}: ProductGridProps) {
  const [columns, setColumns] = useState(columnsProp ?? getColumns);
  const parentRef = useRef<HTMLDivElement>(null);

  // Keep columns in sync with viewport width
  useEffect(() => {
    if (columnsProp) return;
    const observer = new ResizeObserver(() => setColumns(getColumns()));
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [columnsProp]);

  // Split products into rows
  const rows: ProductCardData[][] = [];
  for (let i = 0; i < products.length; i += columns) {
    rows.push(products.slice(i, i + columns));
  }

  // Estimated row height (portrait cards at various breakpoints)
  const estimateRowHeight = useCallback(() => {
    if (typeof window === "undefined") return 420;
    const cardWidth =
      (parentRef.current?.offsetWidth ?? window.innerWidth) / columns;
    // aspect-ratio 3/4 + ~60px for the info below the image
    return Math.round((cardWidth * 4) / 3) + 60;
  }, [columns]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () =>
      typeof window !== "undefined" ? (window as unknown as Element) : null,
    estimateSize: estimateRowHeight,
    overscan: 3,
  });

  if (isLoading) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const rowItems = rows[virtualRow.index];
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div
              className="grid gap-4 pb-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
