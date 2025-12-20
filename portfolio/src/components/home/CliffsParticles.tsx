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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ✅ non-null stable alias for TS
    const canvasEl = canvas;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const ctx2d = ctx;

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
      const parent = canvasEl.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));

      canvasEl.width = Math.floor(w * dpr);
      canvasEl.height = Math.floor(h * dpr);
      canvasEl.style.width = `${w}px`;
      canvasEl.style.height = `${h}px`;

      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = clamp(Math.round(w * h * baseDensity), 70, 140);
      particles = buildParticles(target, w, h);
    }

    function draw(t: number) {
      ctx2d.clearRect(0, 0, w, h);

      const outerAlpha = clamp(opacity, 0, 1);
      if (outerAlpha < 0.01) return;

      for (const p of particles) {
        const tw =
          0.35 +
          0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * p.twinkleSpeed + p.phase));
        const a = p.maxAlpha * tw * outerAlpha;

        if (a < 0.002) continue;

        ctx2d.globalAlpha = a;
        ctx2d.fillStyle =
          p.tint === "red" ? "rgba(124,9,2,1)" : "rgba(255,255,255,1)";

        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2d.fill();
      }

      ctx2d.globalAlpha = 1;
    }

    function step(now: number) {
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
      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    rafRef.current = requestAnimationFrame(step);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
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
