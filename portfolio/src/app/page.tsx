"use client";

import { useEffect, useRef, useState } from "react";
import { cinzel, inter } from "@/lib/fonts";

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sectionRef2 = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;

      const progress = (viewportH - rect.top) / (viewportH + rect.height);
      const p = Math.max(0, Math.min(1, progress));

      const strength = 140;
      setOffset((p - 0.5) * strength);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <main>
      <section ref={sectionRef} className="relative isolate h-[140vh] overflow-hidden pt-24">
        {/* Parallax background (CSS background image) */}
        <div
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            transform: `translate3d(0, ${offset}px, 0)`,
            backgroundImage: "url('/images/horses/bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-black/45" />

        {/* Foreground */}
        <div className="relative z-20 flex min-h-screen items-center px-8">
          <div className="max-w-3xl">
            <div className="mt-1 space-y-2">
              <h1 className={`${cinzel.className} text-5xl font-medium text-white md:text-6xl`}>
                Zach Pawelek
              </h1>
              <p className={`${inter.className} text-base font-light text-white/80 md:text-lg`}>
                Developer
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRef2} className="relative min-h-dvh" />
    </main>
  );
}
