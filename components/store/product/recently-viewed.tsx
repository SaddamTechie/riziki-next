"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StorageImage } from "@/components/shared/storage-image";
import { formatPrice } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const STORAGE_KEY = "riziki_recently_viewed";
const MAX_ITEMS = 12;

interface RecentItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
}

interface RecentlyViewedProps {
  currentProductId: string;
  /** Passed from server to add current product to the list */
  currentProduct: RecentItem;
}

function loadRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
  } catch {
    return [];
  }
}

function saveRecentItems(items: RecentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
}

export function RecentlyViewed({
  currentProductId,
  currentProduct,
}: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    // Load existing viewed items
    const existing = loadRecentItems();
    // Add current product to front (deduplicated)
    const updated = [
      currentProduct,
      ...existing.filter((i) => i.id !== currentProductId),
    ].slice(0, MAX_ITEMS);
    saveRecentItems(updated);
    // Show all except current product
    setItems(updated.filter((i) => i.id !== currentProductId));
  }, [currentProductId, currentProduct]);

  if (!items.length) return null;

  return (
    <section aria-label="Recently viewed">
      <h2 className="mb-4 font-heading text-xl font-bold">Recently Viewed</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group inline-block w-40 shrink-0"
            >
              <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-lg bg-muted">
                <StorageImage
                  src={item.imagePublicId}
                  blurDataUrl={item.imageBlurDataUrl ?? undefined}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="160px"
                />
              </div>
              <p className="mt-2 line-clamp-1 text-xs font-medium group-hover:underline">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(item.price, "KES")}
              </p>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
