"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { StorageImage } from "@/components/shared/storage-image";
import { useDepartmentStore } from "@/stores/department.store";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { QueryKeys } from "@/hooks/use-store-queries";

interface MegaMenuSection {
  id: string;
  label: string;
  href?: string | null;
  items: Array<{
    id: string;
    label: string;
    href: string;
    imagePublicId?: string | null;
    imageBlurDataUrl?: string | null;
    isEditorial: boolean;
  }>;
}

interface MegaMenuMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

async function fetchMegaMenu(dept: string): Promise<MegaMenuSection[]> {
  const res = await fetch(`/api/mega-menu?department=${dept}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return res.json();
}

export function MegaMenuMobile({ isOpen, onClose }: MegaMenuMobileProps) {
  const { selected: department } = useDepartmentStore();
  const [openItem, setOpenItem] = useState<string>("");

  const { data: sections, isLoading } = useQuery<MegaMenuSection[]>({
    queryKey: QueryKeys.megaMenu(department ?? undefined),
    queryFn: () => fetchMegaMenu(department ?? "all"),
    staleTime: 1000 * 60 * 10,
    enabled: isOpen,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="flex w-[85vw] max-w-sm flex-col p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="font-heading text-base capitalize">
            {department ?? "Menu"}
          </SheetTitle>
        </SheetHeader>

        {/* Quick links */}
        <div className="border-b px-4 py-3">
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {["Women", "Men", "Beauty", "Sale"].map((label) => (
              <Link
                key={label}
                href={
                  label === "Sale"
                    ? "/products?sale=true"
                    : `/products?department=${label.toLowerCase()}`
                }
                onClick={onClose}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Menu sections */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !sections?.length ? (
            <div className="p-4 text-sm text-muted-foreground">
              No categories found
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={setOpenItem}
              className="px-2"
            >
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-none"
                >
                  <AccordionTrigger className="rounded-lg px-2 py-3 text-sm font-medium hover:bg-accent hover:no-underline">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent"
                          >
                            {item.imagePublicId && (
                              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
                                <StorageImage
                                  src={item.imagePublicId}
                                  blurDataUrl={
                                    item.imageBlurDataUrl ?? undefined
                                  }
                                  alt={item.label}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              </div>
                            )}
                            <span className="flex-1 text-sm">{item.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                        </li>
                      ))}

                      {section.href && (
                        <>
                          <Separator className="my-1" />
                          <li>
                            <Link
                              href={section.href}
                              onClick={onClose}
                              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-primary hover:bg-accent"
                            >
                              View all {section.label}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Bottom links */}
        <div className="border-t px-4 py-4 space-y-2">
          {[
            { label: "My Account", href: "/account" },
            { label: "My Orders", href: "/account/orders" },
            { label: "Wishlist", href: "/account/wishlist" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-accent"
            >
              {label}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
