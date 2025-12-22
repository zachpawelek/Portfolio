"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

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
  /** Enable/disable the left/right edge fade */
  edgeFade?: boolean;
};

export default function LifeCarousel({
  images,
  accent = "#7c0902",
  className = "",
  edgeFade = true,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<HTMLElement[]>([]);
  const rafRef = useRef<number | null>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // For smarter arrows
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Lightbox (full picture view)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Portal readiness (prevents SSR/CSR mismatch)
  const [portalReady, setPortalReady] = useState(false);

  const safeImages = useMemo(() => images.filter((x) => !!x?.src), [images]);
  const total = safeImages.length;

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const hydrateItems = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    itemsRef.current = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-item='1']"));
  }, []);

  const scrollToIndex = useCallback(
    (idx: number) => {
      const el = scrollerRef.current;
      if (!el || total === 0) return;

      const clamped = Math.max(0, Math.min(total - 1, idx));

      // Use cached items (fallback to hydrate if needed)
      if (itemsRef.current.length !== total) hydrateItems();
      const target = itemsRef.current[clamped];
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    },
    [hydrateItems, total]
  );

  const scrollByPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }, []);

  // Keyboard support when scroller is focused
  const onScrollerKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollByPage(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollByPage(1);
      }
    },
    [scrollByPage]
  );

  // Track which item is closest to center (dots + counter) + compute canPrev/canNext
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || total === 0) return;

    hydrateItems();

    const update = () => {
      const items = itemsRef.current;
      if (!items.length) return;

      // Use scrollLeft + offsetLeft math (stable even if items have transforms on hover)
      const centerX = el.scrollLeft + el.clientWidth / 2;

      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemCenter = item.offsetLeft + item.clientWidth / 2;
        const dist = Math.abs(itemCenter - centerX);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }

      setActive(best);

      const atStart = el.scrollLeft <= 4;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setCanPrev(!atStart);
      setCanNext(!atEnd);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hydrateItems, total]);

  // Auto-scroll (optional: only if you had it; keeping your existing behavior)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || total <= 1) return;

    if (paused) return;

    const id = window.setInterval(() => {
      if (!el) return;

      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.9, behavior: "smooth" });
      }
    }, 5000);

    return () => window.clearInterval(id);
  }, [paused, total]);

  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIdx(null);
  }, []);

  const activePhoto = lightboxIdx !== null ? safeImages[lightboxIdx] : null;
  const caption = lightboxIdx !== null ? safeImages[lightboxIdx]?.alt ?? `Photo ${lightboxIdx + 1}` : "";

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
            disabled={!canPrev}
            className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-40 disabled:hover:bg-neutral-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Previous photos"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900 disabled:opacity-40 disabled:hover:bg-neutral-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Next photos"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className={[
          "flex gap-4 overflow-x-auto overflow-y-visible pb-3",
          "snap-x snap-mandatory scroll-smooth",
          "rounded-2xl border border-neutral-800 bg-neutral-950/30 p-4",

          // Hide scrollbar (no plugin required)
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",

          // ✅ Subtle edge fade (left/right) — now controllable
          ...(edgeFade
            ? ["[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"]
            : []),
        ].join(" ")}
        role="region"
        aria-label="Photo carousel"
        tabIndex={0}
        onKeyDown={onScrollerKeyDown}
      >
        {safeImages.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            data-carousel-item="1"
            onClick={() => openLightbox(i)}
            className={[
              "group relative shrink-0",
              "w-44 sm:w-52 md:w-56 lg:w-60",
              "snap-center",
              "rounded-xl border border-neutral-800 bg-neutral-900/20",
              "overflow-hidden",
              "transition-transform duration-300",
              "hover:-translate-y-0.5 hover:scale-[1.02]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
            ].join(" ")}
            aria-label={`Open photo ${i + 1} of ${total}`}
            style={active === i ? { boxShadow: `0 0 0 1px ${accent}22` } : undefined}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={img.src}
                alt={img.alt ?? `Photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, (max-width: 1024px) 224px, 240px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom bar: dots | helper text | counter */}
      <div className="mt-3 grid items-center gap-3 sm:grid-cols-3">
        <div className="flex flex-wrap items-center gap-2 justify-start">
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

        <p className="text-center text-[11px] text-neutral-500">
          Click to expand photo with information
        </p>

        <p className="text-right text-xs text-neutral-500">
          {active + 1} / {total}
        </p>
      </div>

      {/* Lightbox / Full picture view */}
      {portalReady && lightboxIdx !== null && activePhoto
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8 md:p-10"
              role="dialog"
              aria-modal="true"
              aria-label="Photo viewer"
            >
              {/* Backdrop (click to close) */}
              <button
                type="button"
                className="absolute inset-0 bg-black/80"
                onClick={closeLightbox}
                aria-label="Close photo viewer"
              />

              <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                <div className="relative aspect-video w-full">
                  <Image
                    src={activePhoto.src}
                    alt={activePhoto.alt ?? "Photo"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-contain bg-black"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-200" style={{ color: "white" }}>
                      {caption}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeLightbox}
                    className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
