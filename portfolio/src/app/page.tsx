"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cinzel, inter } from "@/lib/fonts";

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const nextRef = useRef<HTMLElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);

  const [offset, setOffset] = useState(0);
  const [hideScrollHint, setHideScrollHint] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(1);

  useEffect(() => {
    let raf = 0;
    let canFadeTitle = false;

    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

    const update = () => {
      if (!heroRef.current) return;

      const heroRect = heroRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Parallax
      const progress = (viewportH - heroRect.top) / (viewportH + heroRect.height);
      const p = clamp01(progress);
      const strength = 140;
      setOffset((p - 0.5) * strength);

      // Scroll hint (relative to hero)
      const heroProgress = clamp01((-heroRect.top) / heroRect.height);
      setHideScrollHint(heroProgress > 0.2);

      // Title opacity
      if (!canFadeTitle) {
        setTitleOpacity(1);
        return;
      }

      const headerEl = document.querySelector("header");
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
      const headerBottom = headerRect ? headerRect.bottom : 0;
      const headerH = headerRect ? headerRect.height : 0;

      if (!titleWrapRef.current || headerH <= 0) {
        setTitleOpacity(1);
        return;
      }

      const titleTop = titleWrapRef.current.getBoundingClientRect().top;

      // ---- Smooth ramp (no sudden jump) ----
      // We keep the title at 1 opacity until it gets within `grace` px of the header,
      // then fade it out smoothly over `fadeDistance` px.
      const grace = headerH * 1.25;        // how long it stays fully bright
      const fadeDistance = headerH * 1.5;  // how long the fade lasts

      const fadeStart = headerBottom + grace;                 // opacity = 1 here
      const fadeEnd = headerBottom + Math.max(8, grace - fadeDistance); // opacity = 0 here

      const opacity = clamp01((titleTop - fadeEnd) / (fadeStart - fadeEnd));
      setTitleOpacity(opacity);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();

    const fontSet = document.fonts;
    if (fontSet?.ready) {
      fontSet.ready.then(() => {
        canFadeTitle = true;
        update();
      });
    } else {
      setTimeout(() => {
        canFadeTitle = true;
        update();
      }, 50);
    }

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
      <section ref={heroRef} className="relative h-[140vh] overflow-hidden">
        <div
          className="absolute inset-0 z-0 will-change-transform"
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

        <div className="absolute inset-0 z-10 bg-black/45" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />

        <div className="relative z-20 flex min-h-screen items-start px-8 pt-36 text-white">
          <div ref={titleWrapRef} style={{ opacity: titleOpacity }} className="max-w-3xl will-change-[opacity]">
            <div className="space-y-2">
              <h1 className={`${cinzel.className} text-5xl font-medium md:text-6xl text-white`}>
                Zach Pawelek
              </h1>
              <p className={`${inter.className} text-base font-light text-white md:text-lg`}>
                Developer
              </p>
            </div>
          </div>

          <div
            className={[
              "pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center",
              "transition-opacity duration-700",
              hideScrollHint ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            <div className={`${inter.className} text-sm uppercase tracking-[0.35em] text-white/85`}>
              Scroll
            </div>
            <div className="mt-2 text-2xl text-white/85 animate-bounce">↓</div>
          </div>
        </div>
      </section>

      <section ref={nextRef} className="relative min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white"
      >
      <div className="mx-auto max-w-6xl">
    <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
      About Me
    </h2>

    <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
      {/* Headshot */}
      <div className="flex justify-center md:justify-start">
        <div className="relative h-72 w-72 overflow-hidden rounded-3xl ring-1 ring-white/15 md:h-115 md:w-96">
          <Image
            src="/images/me.jpg"
            alt="Headshot of Zach Pawelek"
            fill
            sizes="(min-width: 768px) 384px, 288px"
            className="object-cover"
            priority={false}
          />
        </div>
      </div>

      {/* Text */}
      <div>
        <p className={`${inter.className} text-base leading-relaxed text-white/75 md:text-lg`}>
          Hello. This is my Bio. I have no idea what I'm going to put here yet but I'm sure it'll
          be great.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/projects"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
          >
            View Projects
          </a>
          <a
            href="/contact"
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  </div>
</section>


      
</main>
  );
}

