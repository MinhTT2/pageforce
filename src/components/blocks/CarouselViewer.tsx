"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { isOptimizedImageUrl } from "@/lib/uploads";
import { cn } from "@/lib/utils";

type CarouselItem = {
  src: string;
  alt: string;
  caption: string;
};

export function CarouselViewer({
  items,
  autoplay,
  priorityFirstSlide = false,
}: {
  items: CarouselItem[];
  autoplay: boolean;
  priorityFirstSlide?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const count = items.length;
  const active = index < count ? index : 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleChange(event: MediaQueryListEvent) {
      setReducedMotion(event.matches);
    }

    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || reducedMotion || count <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [autoplay, count, paused, reducedMotion]);

  function move(delta: number) {
    setIndex((current) => (current + delta + count) % count);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      className="pf-border pf-soft relative overflow-hidden rounded-(--pf-radius) border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={cn("flex", reducedMotion ? "transition-none" : "transition-transform duration-500")}
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {items.map((item, itemIndex) => (
          <div
            key={`${item.src}-${itemIndex}`}
            className="relative aspect-[16/9] min-w-full overflow-hidden bg-(--pf-bg)"
            aria-hidden={itemIndex !== active}
          >
            {item.src ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                priority={priorityFirstSlide && itemIndex === 0}
                unoptimized={!isOptimizedImageUrl(item.src)}
                className="object-cover"
              />
            ) : (
              <div className="pf-muted grid h-full place-items-center text-center">
                <div>
                  <ImageIcon className="mx-auto size-8" />
                  <p className="mt-3 text-sm font-medium">Add an image URL</p>
                </div>
              </div>
            )}
            {item.caption ? (
              // The black scrim is intentionally fixed so captions stay legible on any image.
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-5 pt-12 text-white">
                <p className="text-sm font-medium sm:text-base">{item.caption}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => move(-1)}
            className="pf-btn-primary absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => move(1)}
            className="pf-btn-primary absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {items.map((item, itemIndex) => (
              <button
                key={`${item.src}-dot-${itemIndex}`}
                type="button"
                aria-label={`Go to slide ${itemIndex + 1}`}
                aria-current={itemIndex === active}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "size-2.5 rounded-full border border-white/70 bg-white/60 transition",
                  itemIndex === active && "bg-(--pf-primary)",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
