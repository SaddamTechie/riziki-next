"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { StorageImage } from "@/components/shared/storage-image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProductImage {
  publicId: string;
  blurDataUrl?: string | null;
  altText?: string | null;
  displayOrder: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
        No images
      </div>
    );
  }

  function prev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActiveIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:w-20 md:flex-col md:overflow-y-auto md:overflow-x-visible">
          {images.map((img, i) => (
            <button
              key={img.publicId}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                i === activeIndex
                  ? "border-foreground"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <StorageImage
                src={img.publicId}
                blurDataUrl={img.blurDataUrl ?? undefined}
                alt={img.altText ?? productName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative order-1 flex-1 md:order-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.publicId}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StorageImage
                src={active.publicId}
                blurDataUrl={active.blurDataUrl ?? undefined}
                alt={active.altText ?? productName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Prev / next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Zoom trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 bg-background/70 backdrop-blur-sm hover:bg-background/90"
                aria-label="Zoom image"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-background p-2">
              <VisuallyHidden>
                <DialogTitle>{productName}</DialogTitle>
              </VisuallyHidden>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                wheel={{ step: 0.3 }}
              >
                <TransformComponent
                  wrapperStyle={{ width: "100%" }}
                  contentStyle={{ width: "100%" }}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <StorageImage
                      src={active.publicId}
                      alt={active.altText ?? productName}
                      fill
                      className="object-contain"
                      sizes="900px"
                    />
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-muted-foreground/40",
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
