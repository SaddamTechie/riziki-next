import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, User, ArrowRight } from "lucide-react";

export const metadata = { title: "My Account" };

const QUICK_LINKS = [
  {
    label: "My Orders",
    description: "Track and manage your orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    label: "Wishlist",
    description: "Items you've saved for later",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Profile",
    description: "Update your name and details",
    href: "/account/profile",
    icon: User,
  },
];

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?callbackUrl=/account");

  return (
    <div>
      <h1 className="mb-2 font-heading text-xl font-bold">
        Hi, {session.user.name?.split(" ")[0] ?? "there"} 👋
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Welcome to your account dashboard.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border bg-card p-5 hover:border-foreground/30 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
