"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Photo = {
  src: string;
  alt?: string;
};

type Props = {
  images: Photo[];
  /** Accent color used for active dot + subtle hover ring */
  accent?: string;
  /** Optional extra classes on the wrapper */
  className?: string;
};

export default function LifeCarousel({ images, accent = "#7c0902", className = "" }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const safeImages = useMemo(() => images.filter((x) => !!x?.src), [images]);
  const total = safeImages.length;

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-item='1']"));
    const target = items[idx];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Track which item is closest to the center (for dots + counter)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || total === 0) return;

    const update = () => {
      const center = el.getBoundingClientRect().left + el.clientWidth / 2;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-item='1']"));
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      setActive(best);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [total]);

  // Auto-advance (respects reduced motion; pauses on hover/focus)
  useEffect(() => {
    if (total <= 1) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;

    if (paused) return;

    const el = scrollerRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    }, 4200);

    return () => window.clearInterval(id);
  }, [paused, total]);

  if (total === 0) {
    return (
      <div className={["rounded-xl border border-neutral-800 bg-neutral-950/40 p-4", className].join(" ")}>
        <p className="text-sm text-neutral-400">
          Add 6–10 photos to <span className="text-neutral-200">/public/images/life/</span> and
          update the list in <span className="text-neutral-200">about/page.tsx</span>.
        </p>
      </div>
    );
  }

  return (
    <div
      className={["relative", className].join(" ")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Photos</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Previous photos"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Next photos"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={[
          "flex gap-4 overflow-x-auto pb-3",
          "snap-x snap-mandatory scroll-smooth",
          "rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4",
        ].join(" ")}
        role="region"
        aria-label="Personal photo carousel"
      >
        {safeImages.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            data-carousel-item="1"
            onClick={() => scrollToIndex(i)}
            className={[
              "group relative shrink-0",
              "w-44 sm:w-52 md:w-56 lg:w-60",
              "snap-center",
              "rounded-xl border border-neutral-800 bg-neutral-900/20",
              "overflow-hidden",
              "transition-transform duration-300",
              "hover:-translate-y-0.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
            ].join(" ")}
            aria-label={`View photo ${i + 1} of ${total}`}
            style={active === i ? { boxShadow: `0 0 0 1px ${accent}66` } : undefined}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={img.src}
                alt={img.alt ?? `Personal photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, (max-width: 1024px) 224px, 240px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: `${accent}22` }}
              />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className="h-2.5 w-2.5 rounded-full border border-neutral-700 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label={`Go to photo ${i + 1}`}
              style={{ backgroundColor: active === i ? accent : "transparent" }}
            />
          ))}
        </div>

        <p className="text-xs text-neutral-500">
          {active + 1} / {total}
        </p>
      </div>
    </div>
  );
}
