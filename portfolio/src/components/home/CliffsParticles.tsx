"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  opacity?: number;
  density?: number;
  speed?: number;
};

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  twinkleSpeed: number;
  maxAlpha: number;
  tint: "white" | "red";
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export default function CliffsParticles({ opacity = 1, density, speed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let disposed = false;

    const getCanvas = () => canvasRef.current;

    const canvas0 = getCanvas();
    if (!canvas0) return;

    const ctx0 = canvas0.getContext("2d");
    if (!ctx0) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let lastT = performance.now();

    const baseDensity = density ?? 0.00014;
    const speedMul = speed ?? 1;

    let inView = true;
    let pageVisible = document.visibilityState !== "hidden";
    let running = false;

    function buildParticles(count: number, width: number, height: number): Particle[] {
      const out: Particle[] = [];
      const avoidRadius = Math.min(width, height) * 0.28;

      const accept = (x: number, y: number) => {
        const tl = Math.hypot(x - 0, y - 0);
        const br = Math.hypot(x - width, y - height);
        const tlWeight = tl < avoidRadius ? tl / avoidRadius : 1;
        const brWeight = br < avoidRadius ? br / avoidRadius : 1;
        return Math.random() < tlWeight * brWeight;
      };

      while (out.length < count) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        if (!accept(x, y)) continue;

        const r = 0.9 + Math.random() * 1.9;
        const slow = 0.06 + Math.random() * 0.18;

        const vx = (Math.random() - 0.5) * slow * 18 * speedMul;
        const vy = (0.35 + Math.random() * 0.65) * slow * 22 * speedMul;

        const twinkleSpeed = 0.5 + Math.random() * 0.9;
        const phase = Math.random() * Math.PI * 2;

        const maxAlpha = 0.07 + Math.random() * 0.15;
        const tint: Particle["tint"] = Math.random() < 0.2 ? "red" : "white";

        out.push({ x, y, r, vx, vy, phase, twinkleSpeed, maxAlpha, tint });
      }

      return out;
    }

    function resize() {
      if (disposed) return;

      const canvasEl = getCanvas();
      if (!canvasEl) return;

      const ctx = canvasEl.getContext("2d");
      if (!ctx) return;

      const parent = canvasEl.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor(rect.width));
      const nextH = Math.max(1, Math.floor(rect.height));
      if (nextW === w && nextH === h) return;

      w = nextW;
      h = nextH;

      canvasEl.width = Math.floor(w * dpr);
      canvasEl.height = Math.floor(h * dpr);
      canvasEl.style.width = `${w}px`;
      canvasEl.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = clamp(Math.round(w * h * baseDensity), 70, 140);
      particles = buildParticles(target, w, h);
    }

    function draw(t: number) {
      if (disposed) return;

      const canvasEl = getCanvas();
      if (!canvasEl) return;

      const ctx = canvasEl.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);

      const outerAlpha = clamp(opacity, 0, 1);
      if (outerAlpha < 0.01) return;

      for (const p of particles) {
        const tw =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * p.twinkleSpeed + p.phase));
        const a = p.maxAlpha * tw * outerAlpha;

        if (a < 0.002) continue;

        ctx.globalAlpha = a;
        ctx.fillStyle = p.tint === "red" ? "rgba(124,9,2,1)" : "rgba(255,255,255,1)";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    function step(now: number) {
      // Hard stop if unmounted/disposed (prevents “canvas is null” issues)
      if (disposed || !running) return;

      const dt = clamp((now - lastT) / 16.6667, 0, 2);
      lastT = now;

      if (!prefersReduced) {
        for (const p of particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.y > h + 10) p.y = -10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }
      }

      draw(now);

      if (inView && pageVisible && !disposed) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        running = false;
      }
    }

    function start() {
      if (disposed) return;
      if (running) return;
      if (!inView || !pageVisible) return;
      if (!getCanvas()) return;

      // reduced motion: render once
      if (prefersReduced) {
        resize();
        draw(performance.now());
        return;
      }

      running = true;
      lastT = performance.now();
      rafRef.current = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    resize();
    start();

    const onResize = () => {
      resize();
      if (inView && pageVisible) start();
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Observe visibility in viewport
    const canvasForObserver = getCanvas();
    const target = canvasForObserver?.parentElement ?? canvasForObserver ?? null;

    const io =
      target && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              inView = !!entry?.isIntersecting;
              if (inView) start();
              else stop();
            },
            { root: null, threshold: 0 }
          )
        : null;

    if (io && target) io.observe(target);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [opacity, density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}
