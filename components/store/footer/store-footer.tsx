import Link from "next/link";
import { getSiteConfig } from "@/lib/config/site";
import { StorageImage } from "@/components/shared/storage-image";
import { Separator } from "@/components/ui/separator";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { NewsletterForm, CopyrightYear } from "./footer-client";

const FOOTER_NAV = [
  {
    heading: "Shop",
    links: [
      { label: "New In", href: "/products?sort=newest" },
      { label: "Women", href: "/products?department=women" },
      { label: "Men", href: "/products?department=men" },
      { label: "Beauty", href: "/products?department=beauty" },
      { label: "Sale", href: "/products?sale=true" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Size Guide", href: "/size-guide" },
      { label: "Delivery Info", href: "/delivery" },
      { label: "Returns", href: "/returns" },
      { label: "Track Order", href: "/account/orders" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export async function StoreFooter() {
  const config = await getSiteConfig();

  return (
    <footer className="bg-muted/40 border-t">
      {/* Newsletter strip */}
      <div className="bg-foreground text-background py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-heading text-lg font-semibold">
                Get the latest drops
              </p>
              <p className="text-sm opacity-70 mt-0.5">
                New arrivals, exclusive offers — straight to your inbox.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="inline-block">
              {config.logoPublicId ? (
                <StorageImage
                  src={config.logoPublicId}
                  alt={config.siteName}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <span className="font-heading text-xl font-bold">
                  {config.siteName}
                </span>
              )}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
              {config.siteTagline ?? "Fashion that moves with you."}
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-foreground hover:text-background transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map((section) => (
            <div key={section.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                {section.heading}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <CopyrightYear siteName={config.siteName} />
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
