"use client";

import Link from "next/link";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { ThemeToggle } from "@/components/store/theme-toggle/theme-toggle";
import { MegaMenuDesktop } from "@/components/store/mega-menu/mega-menu-desktop";
import { MegaMenuMobile } from "@/components/store/mega-menu/mega-menu-mobile";
import { SearchBar } from "./search-bar";
import { StorageImage } from "@/components/shared/storage-image";
import type { SiteConfig } from "@/lib/config/site";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MainNavProps {
  config: SiteConfig;
}

export function MainNav({ config }: MainNavProps) {
  const { itemCount, openCart } = useCartStore();
  const wishlistCount = useWishlistStore((s) => s.count());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const count = itemCount();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Logo */}
      <Link
        href="/"
        className="flex-shrink-0 font-heading text-xl font-semibold tracking-tight md:text-2xl"
        aria-label={config.siteName}
      >
        {config.logoUrl ? (
          <StorageImage
            src={config.logoPublicId ?? config.logoUrl}
            blurDataUrl={config.logoBlurDataUrl ?? undefined}
            alt={config.siteName}
            width={120}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
        ) : (
          config.siteName
        )}
      </Link>

      {/* Desktop mega menu — grows to fill space */}
      <div className="hidden flex-1 lg:flex lg:items-center lg:justify-center">
        <MegaMenuDesktop />
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Search toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => setIsSearchOpen((v) => !v)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Wishlist */}
        <Link
          href="/account/wishlist"
          aria-label={`Wishlist (${wishlistCount})`}
        >
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Cart */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Cart (${count} items)`}
          onClick={openCart}
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>

        {/* Account */}
        <Link href="/account" aria-label="Account">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>

      {/* Search overlay */}
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}

      {/* Mobile mega menu */}
      <MegaMenuMobile
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
