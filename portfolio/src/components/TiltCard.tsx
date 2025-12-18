"use client";

import { useEffect, useRef } from "react";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;

  /** max tilt in degrees */
  maxTilt?: number;
  /** perspective distance in px */
  perspective?: number;
  /** scale on hover */
  scale?: number;
  /** adds a subtle moving highlight */
  glare?: boolean;
  /** 0–0.25 is typical */
  glareOpacity?: number;
};

/**
 * Subtle 3D tilt wrapper (desktop hover only), respects prefers-reduced-motion.
 * No React re-renders on mouse move (uses CSS variables written to the element).
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  perspective = 900,
  scale = 1.01,
  glare = true,
  glareOpacity = 0.12,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const enabledRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const targetRef = useRef({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

    enabledRef.current = !prefersReduced && !!finePointer;

    // set defaults
    el.style.setProperty("--tc-perspective", `${perspective}px`);
    el.style.setProperty("--tc-scale", "1");
    el.style.setProperty("--tc-rx", "0deg");
    el.style.setProperty("--tc-ry", "0deg");
    el.style.setProperty("--tc-gx", "50%");
    el.style.setProperty("--tc-gy", "50%");

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [perspective]);

  function scheduleWrite() {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const el = ref.current;
      if (!el) return;

      const { rx, ry, gx, gy } = targetRef.current;
      el.style.setProperty("--tc-rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tc-ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--tc-gx", `${gx.toFixed(2)}%`);
      el.style.setProperty("--tc-gy", `${gy.toFixed(2)}%`);
    });
  }

  function onPointerEnter() {
    if (!enabledRef.current) return;
    const el = ref.current;
    if (!el) return;

    el.style.setProperty("--tc-scale", String(scale));
    el.style.transition = "transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!enabledRef.current) return;
    const el = ref.current;
    if (!el) return;

    // Disable transition while actively moving (feels snappier)
    el.style.transition = "none";

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;  // 0..1
    const y = (e.clientY - rect.top) / rect.height;  // 0..1

    // Convert to -1..1 range around center
    const dx = (x - 0.5) * 2;
    const dy = (y - 0.5) * 2;

    // Tilt: rotateX responds to vertical movement (invert for natural feel)
    const rx = (-dy * maxTilt);
    const ry = (dx * maxTilt);

    targetRef.current.rx = rx;
    targetRef.current.ry = ry;

    // Glare position (percent)
    targetRef.current.gx = x * 100;
    targetRef.current.gy = y * 100;

    scheduleWrite();
  }

  function onPointerLeave() {
    if (!enabledRef.current) return;
    const el = ref.current;
    if (!el) return;

    // Smoothly settle back to rest
    el.style.transition = "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.setProperty("--tc-scale", "1");

    targetRef.current.rx = 0;
    targetRef.current.ry = 0;
    targetRef.current.gx = 50;
    targetRef.current.gy = 50;

    scheduleWrite();
  }

  return (
    <div
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={[
        "relative",
        // important for the illusion:
        "[transform-style:preserve-3d]",
        // small perf hint:
        "will-change-transform",
        className,
      ].join(" ")}
      style={{
        transform:
          "perspective(var(--tc-perspective)) rotateX(var(--tc-rx)) rotateY(var(--tc-ry)) scale(var(--tc-scale))",
      }}
    >
      {glare ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            opacity: glareOpacity,
            background:
              "radial-gradient(600px circle at var(--tc-gx) var(--tc-gy), rgba(255,255,255,0.16), transparent 40%)",
          }}
        />
      ) : null}

      {children}
    </div>
  );
}
