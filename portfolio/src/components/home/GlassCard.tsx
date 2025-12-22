"use client";

import React, { useMemo, useState } from "react";
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

export default function GlassCard({
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
  const [flipped, setFlipped] = useState(defaultFlipped);

  const wrapperClass = useMemo(
    () =>
      [
        // ✅ your no-image noise overlay from globals.css
        "glass-noise",

        "group relative overflow-hidden rounded-2xl",
        "border border-white/10 ring-1 ring-white/10",
        "bg-white/5 backdrop-blur-xl",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_22px_70px_-45px_rgba(0,0,0,0.85)]",
        "transform-gpu transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]",
        "hover:shadow-[0_28px_90px_-45px_rgba(0,0,0,0.95)]",
        // enter animation (requires keyframes in globals.css)
        "animate-[fadeUp_700ms_ease-out_both]",
        // optional gentle float (requires keyframes in globals.css)
        "motion-safe:animate-[float_7s_ease-in-out_infinite]",
      ].join(" "),
    []
  );

  const overlays = (
    <>
      {/* crisp top specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

      {/* subtle highlight bloom */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.16),transparent_55%)]" />

      {/* sheen sweep */}
      <div
        className={[
          "pointer-events-none absolute inset-0 opacity-0 transition-all duration-700",
          "bg-linear-to-r from-transparent via-white/10 to-transparent",
          "translate-x-[-120%] group-hover:opacity-100 group-hover:translate-x-[120%]",
        ].join(" ")}
      />
    </>
  );

  return (
    <div className={wrapperClass} style={{ animationDelay: `${delayMs}ms` }}>
      {overlays}

      {/* Flip button (Option A): only this is clickable for flipping */}
      {hasBack ? (
        <button
          type="button"
          aria-label={flipped ? "Show front" : "Show more"}
          aria-pressed={flipped}
          onClick={(e) => {
            e.stopPropagation();
            setFlipped((v) => !v);
          }}
          className={[
            "absolute right-4 top-4 z-20",
            "inline-flex items-center gap-1.5",
            "rounded-full",
            "border border-white/15 bg-white/5 backdrop-blur",
            "px-2 py-1.5",
            "text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
            "transition-all duration-200",
            "hover:bg-white/10 hover:text-white",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25",
          ].join(" ")}
        >
          {/* simple “refresh/flip” icon */}
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

          {/* ✅ label: always visible */}
          <span className={`${inter.className} text-[10px] uppercase tracking-[0.22em] opacity-100`}>
            {flipped ? "Back" : "More"}
          </span>
        </button>
      ) : null}

      {/* 3D flip stage */}
      <div style={{ perspective: "1200px" }} className="relative">
        <div
          className={[
            // grid overlay keeps height = max(front, back)
            "grid",
            "transform-3d",
            "transition-transform duration-700 ease-out",
            "motion-reduce:transition-none",
            flipped ? "transform-[rotateY(180deg)]" : "transform-[rotateY(0deg)]",
          ].join(" ")}
        >
          {/* FRONT */}
          <div
            className={[
              "col-start-1 row-start-1",
              // ✅ shift content down without increasing overall height, and reserve space on the right for the button
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

          {/* BACK */}
          {hasBack ? (
            <div
              className={[
                "col-start-1 row-start-1",
                // ✅ same padding strategy as front so heights match
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
