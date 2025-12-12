"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cinzel, cormorantSC, manrope, inter } from "@/lib/fonts";

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
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

  const headline = "Your Name";

  return (
    <main>
      <section ref={sectionRef} className="relative h-[120vh] overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(0, ${offset}px, 0)` }}
        >
          <Image
            src="/images/horses/bg.jpg"
            alt="Rock background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Foreground */}
        <div className="relative z-10 flex min-h-screen items-center px-8">
          <div className="max-w-3xl text-white">
           
            <div className="mt-6 space-y-6">
              <h1 className={`${cinzel.className} text-6xl md:text-5xl font-medium` }>
                Zach Pawelek
              </h1>

              <h1 className={`${cormorantSC.className} text-6xl md:text-5xl font-medium` }>
                Zach Pawelek
              </h1>

              <h1 className={`${inter.className} text-1xl md:text-1xl font-thin`}>
                Developer
              </h1>

              <h1 className={`${manrope.className} text-1xl md:text-1xl font-light`}>
                Developer
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="p-10 space-y-6">
        <h2 className="text-2xl font-semibold">Next section</h2>
        <div className="h-[200vh]" />
      </section>
    </main>
  );
}
