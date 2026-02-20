import Link from "next/link";
import { StorageImage } from "@/components/shared/storage-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

interface LookItem {
  productId: string;
  productSlug: string;
  productName: string;
  imagePublicId: string;
  price: number;
}

interface LookCard {
  id: string;
  slug: string;
  title: string;
  imagePublicId: string;
  imageBlurDataUrl?: string | null;
  totalPrice: number;
  items: LookItem[];
}

interface BuyTheLookSectionProps {
  looks: LookCard[];
}

export function BuyTheLookSection({ looks }: BuyTheLookSectionProps) {
  if (!looks.length) return null;

  return (
    <section className="py-12 sm:py-16" aria-label="Buy the Look">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              Editorial
            </Badge>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">
              Buy the Look
            </h2>
          </div>
          <Link
            href="/looks"
            className="text-sm font-medium underline underline-offset-4 hover:no-underline"
          >
            View all looks
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <article
              key={look.id}
              className="group relative overflow-hidden rounded-2xl bg-muted"
            >
              {/* Main look image */}
              <Link href={`/looks/${look.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <StorageImage
                    src={look.imagePublicId}
                    blurDataUrl={look.imageBlurDataUrl ?? undefined}
                    alt={look.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Product thumbnails strip */}
                  <div className="absolute bottom-16 left-3 flex gap-2">
                    {look.items.slice(0, 4).map((item) => (
                      <div
                        key={item.productId}
                        className="relative h-12 w-10 overflow-hidden rounded border-2 border-white/60"
                      >
                        <StorageImage
                          src={item.imagePublicId}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ))}
                    {look.items.length > 4 && (
                      <div className="flex h-12 w-10 items-center justify-center rounded border-2 border-white/60 bg-black/50 text-xs font-semibold text-white">
                        +{look.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Title + CTA */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="mb-1 text-sm font-semibold text-white">
                      {look.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80">
                        From {formatPrice(look.totalPrice, "KES")}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 gap-1.5 text-xs"
                        asChild
                      >
                        <Link href={`/looks/${look.slug}`}>
                          <ShoppingBag className="h-3 w-3" />
                          Shop Look
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
