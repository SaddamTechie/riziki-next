/**
 * Store layout — wraps all storefront pages.
 * Provides: sticky dept switcher + header, footer, cart drawer.
 */

import { getSiteConfig } from "@/lib/config/site";
import { StoreHeader } from "@/components/store/header/store-header";
import { StoreFooter } from "@/components/store/footer/store-footer";
import { CartDrawer } from "@/components/store/cart-drawer/cart-drawer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader config={config} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      {/* Cart drawer — always mounted, toggled via Zustand */}
      <CartDrawer />
    </div>
  );
}
