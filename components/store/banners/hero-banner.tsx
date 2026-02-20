"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StorageImage } from "@/components/shared/storage-image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroBanner {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  mediaPublicId: string;
  mediaBlurDataUrl?: string | null;
  mediaType: "image" | "video";
  videoPublicId?: string | null;
}

interface HeroBannerProps {
  banners: HeroBanner[];
}

export function HeroBanner({ banners: slides }: HeroBannerProps) {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);

  if (!slides.length) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Hero banners"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative min-w-full"
              style={{ aspectRatio: "16/7" }}
            >
              {/* Background media */}
              {slide.mediaType === "video" && slide.videoPublicId ? (
                <video
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_auto,q_auto/${slide.videoPublicId}`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <StorageImage
                  src={slide.mediaPublicId}
                  blurDataUrl={slide.mediaBlurDataUrl ?? undefined}
                  alt={slide.title ?? "Banner"}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

              {/* Content */}
              {(slide.title || slide.ctaText) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md space-y-4">
                      {slide.title && (
                        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                          {slide.title}
                        </h2>
                      )}
                      {slide.subtitle && (
                        <p className="text-white/80 text-sm sm:text-base">
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.ctaText && slide.ctaUrl && (
                        <Button size="lg" asChild className="mt-2">
                          <Link href={slide.ctaUrl}>{slide.ctaText}</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows (only when multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "flex h-9 w-9 items-center justify-center rounded-full",
              "bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors",
            )}
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "flex h-9 w-9 items-center justify-center rounded-full",
              "bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors",
            )}
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                className="h-1.5 w-6 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
