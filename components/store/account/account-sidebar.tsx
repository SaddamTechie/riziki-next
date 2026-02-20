"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "My Orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: User,
  },
];

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <aside className="w-full md:w-60 shrink-0">
      {/* User card */}
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm font-semibold bg-primary text-primary-foreground">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">
            {user?.name ?? "Account"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Nav links */}
      <nav aria-label="Account navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {!active && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="my-4" />

      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </aside>
  );
}
