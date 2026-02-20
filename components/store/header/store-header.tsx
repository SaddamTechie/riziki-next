/**
 * Store Header — Server Component shell + Client sub-components.
 *
 * Structure:
 *   [DepartmentBar]   — Men / Women / Beauty tabs (sticky, dept-scoped)
 *   [MainNav]         — Logo, search, wishlist count, cart toggle, user
 *   [MegaMenuPanel]   — Opens on nav category hover
 */

import { Suspense } from "react";
import { getSiteConfig } from "@/lib/config/site";
import type { SiteConfig } from "@/lib/config/site";
import { DepartmentBar } from "./department-bar";
import { MainNav } from "./main-nav";

interface StoreHeaderProps {
  config: SiteConfig;
}

export function StoreHeader({ config }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Department switcher — only shown if more than 1 dept active */}
      {config.activeDepartments.length > 1 && (
        <DepartmentBar activeDepartments={config.activeDepartments} />
      )}
      {/* Main nav */}
      <MainNav config={config} />
    </header>
  );
}
