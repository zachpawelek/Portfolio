"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { cinzel, inter } from "@/lib/fonts";

type GlassCardProps = {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  delayMs?: number;

  // Optional backside content (enables flip button)
  backTitle?: string;
  backKicker?: string;
  backChildren?: React.ReactNode;

  // Optional initial state
  defaultFlipped?: boolean;
};

/**
 * GlassCard perf notes
 * - Backside content is lazily mounted on first flip (cuts initial DOM/layout work).
 * - `backdrop-filter` is expensive while scrolling (browser must re-blur as the backdrop moves).
 * - We add containment + content-visibility hints to reduce paint/layout cost during scroll.
 */
function GlassCardImpl({
  title,
  kicker,
  children,
  delayMs = 0,
  backTitle,
  backKicker,
  backChildren,
  defaultFlipped = false,
}: GlassCardProps) {
  const hasBack = !!(backTitle || backKicker || backChildren);

  // Flip state
  const [flipped, setFlipped] = useState(defaultFlipped);

  // Lazy-mount the back face only when needed (improves initial scroll performance)
  const [backMounted, setBackMounted] = useState<boolean>(defaultFlipped && hasBack);
  useEffect(() => {
    if (defaultFlipped && hasBack) setBackMounted(true);
  }, [defaultFlipped, hasBack]);

  const wrapperClass = useMemo(
    () =>
      [
        // noise overlay from globals.css
        "glass-noise",

        // ✅ used by globals.css to disable blur only while scrolling
        "glass-surface",

        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 ring-1 ring-white/10",

        // Backdrop blur is costly while scrolling; keep it high on desktop, reduce on small screens.
        "bg-white/5 backdrop-blur-md md:backdrop-blur-xl",

        "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_22px_70px_-45px_rgba(0,0,0,0.85)]",

        // GPU-friendly transforms + scoped transitions (avoid transition-all)
        "transform-gpu",
        "transition-[transform,background-color,border-color,opacity,box-shadow] duration-300 ease-out",

        "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]",
        "hover:shadow-[0_28px_90px_-45px_rgba(0,0,0,0.95)]",

        // enter animation
        "animate-[fadeUp_700ms_ease-out_both]",

        // gentle float: enable on md+ only (small screens are most impacted)
        "motion-safe:md:animate-[float_7s_ease-in-out_infinite]",
      ].join(" "),
    []
  );

  const perfStyle = useMemo(
    () =>
      ({
        animationDelay: `${delayMs}ms`,
        contain: "layout paint",
        contentVisibility: "auto",
        // prevents layout jump when content-visibility kicks in
        containIntrinsicSize: "320px 240px",
      }) as React.CSSProperties,
    [delayMs]
  );

  const onFlip = useCallback(() => {
    if (hasBack && !backMounted) setBackMounted(true);
    setFlipped((v) => !v);
  }, [hasBack, backMounted]);

  const overlays = (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.16),transparent_55%)]" />
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0",
          "transition-[transform,opacity] duration-700",
          "bg-linear-to-r from-transparent via-white/10 to-transparent",
          "translate-x-[-120%] group-hover:opacity-100 group-hover:translate-x-[120%]",
        ].join(" ")}
      />
    </>
  );

  return (
    <div className={wrapperClass} style={perfStyle}>
      {overlays}

      {hasBack ? (
        <button
          type="button"
          aria-label={flipped ? "Show front" : "Show more"}
          aria-pressed={flipped}
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className={[
            // ✅ also gets blur-disabled while scrolling
            "glass-surface",

            "absolute right-4 top-4 z-20",
            "inline-flex items-center gap-1.5",
            "rounded-full",
            "border border-white/15 bg-white/5 backdrop-blur",
            "px-2 py-1.5",
            "text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
            "transition-[transform,background-color,color,opacity] duration-200",
            "hover:bg-white/10 hover:text-white",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
          ].join(" ")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={["transition-transform duration-300", flipped ? "rotate-180" : ""].join(" ")}
            aria-hidden="true"
          >
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M20 4v6h-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className={`${inter.className} text-[10px] uppercase tracking-[0.22em] opacity-100`}>
            {flipped ? "Back" : "More"}
          </span>
        </button>
      ) : null}

      <div style={{ perspective: "1200px" }} className="relative">
        <div
          className={[
            "grid",
            "transform-3d",
            "will-change-transform",
            "transition-transform duration-700 ease-out",
            "motion-reduce:transition-none",
            flipped ? "transform-[rotateY(180deg)]" : "transform-[rotateY(0deg)]",
          ].join(" ")}
        >
          {/* FRONT */}
          <div
            className={[
              "col-start-1 row-start-1",
              "relative px-6 pt-10 pb-2 pr-16 md:px-7 md:pt-12 md:pb-2 md:pr-18",
              "backface-hidden",
              flipped ? "pointer-events-none" : "pointer-events-auto",
            ].join(" ")}
          >
            {kicker ? (
              <div className={`${inter.className} text-xs uppercase tracking-[0.35em] text-white/60`}>
                {kicker}
              </div>
            ) : null}

            <h3 className={`${cinzel.className} mt-2 text-xl font-medium text-white md:text-2xl`}>
              {title}
            </h3>

            <div className={`${inter.className} mt-3 text-sm leading-relaxed text-white/70`}>
              {children}
            </div>
          </div>

          {/* BACK (lazy-mounted) */}
          {hasBack && backMounted ? (
            <div
              className={[
                "col-start-1 row-start-1",
                "relative px-6 pt-10 pb-2 pr-16 md:px-7 md:pt-12 md:pb-2 md:pr-18",
                "backface-hidden",
                "transform-[rotateY(180deg)]",
                flipped ? "pointer-events-auto" : "pointer-events-none",
              ].join(" ")}
            >
              {backKicker ? (
                <div className={`${inter.className} text-xs uppercase tracking-[0.35em] text-white/60`}>
                  {backKicker}
                </div>
              ) : null}

              <h3 className={`${cinzel.className} mt-2 text-xl font-medium text-white md:text-2xl`}>
                {backTitle ?? title}
              </h3>

              <div className={`${inter.className} mt-3 text-sm leading-relaxed text-white/70`}>
                {backChildren ?? children}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(GlassCardImpl);
