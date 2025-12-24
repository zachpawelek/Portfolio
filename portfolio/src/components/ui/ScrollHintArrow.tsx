"use client";

import { useEffect, useRef } from "react";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Renders a bouncing ↓ arrow that fades out as you scroll past the hero section.
 * Works by finding the nearest parent <section> and computing scroll progress.
 *
 * Mobile-only by default (md:hidden).
 */
export default function ScrollHintArrow({
  threshold = 0.3, // when heroProgress > threshold -> fade out
  className = "",
}: {
  threshold?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Find the hero section this arrow lives inside
    const heroSection = el.closest("section") as HTMLElement | null;
    if (!heroSection) return;

    const update = () => {
      const rect = heroSection.getBoundingClientRect();
      // same idea as your Home page: progress goes 0 -> 1 as hero scrolls away
      const heroProgress = clamp01((-rect.top) / rect.height);
      const hide = heroProgress > threshold;

      el.style.opacity = hide ? "0" : "1";
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [threshold]);

  return (
    <div
      ref={wrapRef}
      className={[
        "pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2",
        "md:hidden",
        "transition-opacity duration-700",
        className,
      ].join(" ")}
    >
      <div className="text-2xl text-white/85 animate-bounce" aria-hidden>
        ↓
      </div>
      <span className="sr-only">Scroll for more</span>
    </div>
  );
}
