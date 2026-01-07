"use client"; // Next.js App Router directive: this file runs on the client (uses hooks like useState/useEffect)

import Image from "next/image"; // Optimized image component
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"; // React hooks
import { cinzel, inter } from "@/lib/fonts"; // Your custom font objects
import SocialLinks from "@/components/footer/SocialLinks";
import CliffsParticles from "@/components/home/CliffsParticles";
import GlassCard from "@/components/home/GlassCard";
import ResponsiveNotice from "@/components/ui/ResponsiveNotice";


/**
 * clamp01:
 * Utility to clamp any number into the 0..1 range.
 * This is used for opacity math (opacity must stay between 0 and 1).
 */
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * useParallax
 * -----------------------------------------------------------------------------
 * PURPOSE:
 * Creates a "passive parallax" controller for a section.
 *
 * KEY POINTS:
 * - It does NOT add its own scroll listeners.
 * - Instead, your main RAF loop calls `update(viewportH)`.
 * - `update` is stable (useCallback), so your useEffect dependencies are stable
 *   and you avoid flicker/re-running the effect.
 *
 * HOW IT WORKS:
 * - We measure the element's bounding rect each update.
 * - We compute a normalized progress of the element relative to the viewport.
 * - That progress (0..1) becomes an offset multiplier.
 * - We store the offset in state and apply it as translate3d(...) to the image wrapper.
 */
function useParallax<TSection extends HTMLElement, TLayer extends HTMLElement>(strength = 140) {
  const ref = useRef<TSection | null>(null); // attach to the section we want to measure
  const layerRef = useRef<TLayer | null>(null); // attach to the element we want to translate

  /**
   * PERF NOTE:
   * The original version stored `offset` in React state and used it in render.
   * That means every scroll/RAF tick re-rendered the *entire* page.
   *
   * This version writes the computed transform directly to the parallax layer's style,
   * so scrolling doesn't trigger React renders (much smoother on slower devices).
   */
  const strengthRef = useRef(strength);
  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  const update = useCallback((viewportH: number) => {
    const sectionEl = ref.current;
    const layerEl = layerRef.current;
    if (!sectionEl || !layerEl) return;

    const rect = sectionEl.getBoundingClientRect();
    const progress = (viewportH - rect.top) / (viewportH + rect.height);
    const p = clamp01(progress);
    const offset = (p - 0.5) * strengthRef.current;

    // Avoid tiny string churn; keep a little precision to reduce layout jitter.
    layerEl.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  }, []);

  return { ref, layerRef, update };
}


/**
 * useScrollFade
 * -----------------------------------------------------------------------------
 * PURPOSE:
 * Provides an opacity value (0..1) for a piece of content based on scroll position.
 *
 * It supports:
 * - Fade IN as the element enters from below (based on rect.top).
 * - Optional Fade OUT as the element approaches the header zone (based on rect.bottom).
 *
 * WHY rect.bottom FOR FADE-OUT?
 * - Tall content (like your "About" section) would fade too early if we used rect.top.
 * - Using rect.bottom means fade-out doesn’t begin until the bottom of the block moves into
 *   the header’s “fade zone,” which feels smoother/less abrupt.
 *
 * TUNING OPTIONS:
 * - enterStartMult / enterEndMult:
 *   Control when fade-in starts/ends relative to viewport height.
 * - graceMult / fadeDistMult:
 *   Control when fade-out starts and how long the fade-out lasts, relative to header height.
 * - fadeOut:
 *   Enables/disables the fade-out portion (useful for last section: fade in only).
 */
function useScrollFade<T extends HTMLElement>(opts?: {
  // Fade-in tuning (relative to viewport height)
  enterStartMult?: number; // default 0.9
  enterEndMult?: number; // default 0.6

  // Fade-out tuning (relative to header height)
  graceMult?: number; // default 2.75 (bigger = starts later)
  fadeDistMult?: number; // default 3.5 (bigger = slower fade)

  // Toggle fade-out (keep fade-in)
  fadeOut?: boolean; // default true
}) {
  const ref = useRef<T | null>(null); // attach to the element we want to fade

  /**
   * PERF NOTE:
   * Like useParallax, we avoid React state here. We compute opacity and write it
   * directly to the element's style. This prevents scroll-driven full-page re-renders.
   */
  const optsRef = useRef({
    enterStartMult: opts?.enterStartMult ?? 0.9,
    enterEndMult: opts?.enterEndMult ?? 0.6,
    graceMult: opts?.graceMult ?? 2.75,
    fadeDistMult: opts?.fadeDistMult ?? 3.5,
    fadeOut: opts?.fadeOut ?? true,
  });

  useEffect(() => {
    optsRef.current = {
      enterStartMult: opts?.enterStartMult ?? 0.9,
      enterEndMult: opts?.enterEndMult ?? 0.6,
      graceMult: opts?.graceMult ?? 2.75,
      fadeDistMult: opts?.fadeDistMult ?? 3.5,
      fadeOut: opts?.fadeOut ?? true,
    };
  }, [opts?.enterStartMult, opts?.enterEndMult, opts?.graceMult, opts?.fadeDistMult, opts?.fadeOut]);

  const update = useCallback((viewportH: number, headerBottom: number, headerH: number) => {
    const el = ref.current;
    if (!el) return;

    const { enterStartMult, enterEndMult, graceMult, fadeDistMult, fadeOut } = optsRef.current;

    const rect = el.getBoundingClientRect();

    // Fade IN based on top entering the viewport.
    const enterStart = viewportH * (enterStartMult ?? 0.9);
    const enterEnd = viewportH * (enterEndMult ?? 0.6);
    const enterOpacity = clamp01((enterStart - rect.top) / (enterStart - enterEnd));

    // Optional fade OUT as the bottom approaches the header zone.
    let outOpacity = 1;
    if (fadeOut) {
      const grace = headerH * (graceMult ?? 2.75);
      const fadeDistance = headerH * (fadeDistMult ?? 3.5);
      const fadeStart = headerBottom + grace; // opacity = 1 here
      const fadeEnd = fadeStart - fadeDistance; // opacity = 0 here
      outOpacity = clamp01((rect.bottom - fadeEnd) / (fadeStart - fadeEnd));
    }

    const opacity = enterOpacity * outOpacity;
    el.style.opacity = opacity.toFixed(3);
  }, []);

  return { ref, update };
}
export default function Home() {
  /**
   * Parallax controllers:
   * hero -> horses background section
   * cliffs -> cliffs background section
   */
  const hero = useParallax<HTMLElement, HTMLDivElement>(140);
  const cliffs = useParallax<HTMLElement, HTMLDivElement>(140);

  /**
   * Fade controllers:
   * - aboutFade fades the "About Me" content in AND out near header.
   * - cliffsHeaderFade fades the top-left cliffs heading in/out.
   * - cliffsCardsFade fades the glass card block in/out in the empty space.
   * - cliffsFooterFade fades the bottom-right cliffs "footer" in/out, later than header.
   * - bottomFade fades the final section IN only (no fade-out).
   */
  const aboutFade = useScrollFade<HTMLDivElement>();
  const cliffsHeaderFade = useScrollFade<HTMLDivElement>();

  // Glass cards layer in cliffs (fills dead space, fades in/out)
  const cliffsCardsFade = useScrollFade<HTMLDivElement>({
    enterStartMult: 0.96,
    enterEndMult: 0.76,
    graceMult: 3.25,
    fadeDistMult: 3.1,
  });

  // Bottom-right footer: fades in later and fades out later than the cliffs header.
  const cliffsFooterFade = useScrollFade<HTMLDivElement>({
    enterStartMult: 0.98, // fade-in starts lower in the viewport (later)
    enterEndMult: 0.78, //  fade-in reaches full opacity later
    graceMult: 3.25, //  fade-out starts later (closer to header)
    fadeDistMult: 3.0, //  fade-out duration tuning
  });

  // Bottom-of-page section: fade-in only (no fade-out so it doesn't disappear at the end)
  const bottomFade = useScrollFade<HTMLDivElement>({
    fadeOut: false, //  disables fade-out
    enterStartMult: 0.92,
    enterEndMult: 0.65,
  });

  /**
   * nextRef:
   * You currently attach it to the About section. In this file it isn't used further,
   * but it's kept as-is from your original structure.
   */
  const nextRef = useRef<HTMLElement | null>(null);

  /**
   * titleWrapRef:
   * Points to the hero title block ("Zach Pawelek / Developer") so we can compute its fade
   * based on header position.
   */
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  // Refs used for scroll-driven opacity without triggering React renders
  const scrollHintRef = useRef<HTMLDivElement | null>(null);
  const heroNoticeRef = useRef<HTMLDivElement | null>(null);


  // Newsletter form state (drives input, loading state, and success/error messaging)
  const [subEmail, setSubEmail] = useState(""); // User's email input
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "ok" | "error">("idle"); // UI status
  const [subMsg, setSubMsg] = useState(""); // User-visible message under the form

  /**
   * onSubscribe
   * -----------------------------------------------------------------------------
   * PURPOSE:
   * Connects the newsletter form to your server API route: POST /api/subscribe
   *
   * WHAT IT DOES:
   * - Prevents the browser's default form submit (page reload)
   * - Sends the email as JSON to /api/subscribe
   * - Shows success or error text based on the response
   *
   * NOTE:
   * This step only writes to your database as "pending".
   * The email confirmation flow comes next.
   */
  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubStatus("loading");
    setSubMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const errText =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message
              ? String(data.error.message)
              : JSON.stringify(data?.error ?? "Something went wrong.");

        setSubStatus("error");
        setSubMsg(errText);
        return;
      }

      setSubStatus("ok");

      if (data?.status === "resubscribed") {
        setSubMsg("Welcome back! Check your email to confirm your subscription.");
      } else if (data?.status === "resent") {
        setSubMsg("We sent you a fresh confirmation link. Please check your email.");
      } else if (data?.status === "active") {
        setSubMsg("You're already subscribed.");
      } else {
        setSubMsg("Success! Check your email to confirm your subscription.");
      }

      setSubEmail("");
    } catch {
      setSubStatus("error");
      setSubMsg("Network error. Please try again.");
    }
  }

  /**
   * MAIN SCROLL/RESIZE LOOP
   * -----------------------------------------------------------------------------
   * You do a requestAnimationFrame-throttled update on scroll/resize:
   * - update parallax offsets
   * - update hero scroll hint
   * - measure header geometry
   * - update all fade controllers
   * - update hero title opacity (after fonts are loaded to avoid flicker)
   */
  useLayoutEffect(() => {
    let raf = 0;
    let canFadeTitle = false; // gate hero title fade until fonts settle

    const update = () => {
      if (!hero.ref.current) return;

      const heroRect = hero.ref.current.getBoundingClientRect();
      const viewportH = window.innerHeight;

      /**
       * Parallax updates:
       * These compute offsets and set state, which affects transform styles on image wrappers.
       */
      hero.update(viewportH);
      cliffs.update(viewportH);

      /**
       * Scroll hint:
       * Based on how far the hero has scrolled upward relative to its own height.
       * - When heroProgress > 0.2, we fade out the hint.
       */
      const heroProgress = clamp01((-heroRect.top) / heroRect.height);
      // Responsive notice: fade out + drift right as you scroll down the hero
const noticeFadeStart = 0.10; // start fading after a little scroll
const noticeFadeEnd = 0.28;   // fully gone by here (similar to your hint)
const t = clamp01((heroProgress - noticeFadeStart) / (noticeFadeEnd - noticeFadeStart));
const noticeOpacity = 1 - t;          // 1 -> 0
const noticeSlidePx = t * 28;         // 0 -> 28px to the right

if (heroNoticeRef.current) {
  heroNoticeRef.current.style.opacity = noticeOpacity.toFixed(3);
  heroNoticeRef.current.style.transform = `translate3d(${noticeSlidePx.toFixed(1)}px, 0, 0)`;
}

      const hideHint = heroProgress > 0.2;
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = hideHint ? "0" : "1";

      /**
       * Header metrics:
       * We measure the header position to know where the "fade-out zone" is.
       * headerBottom is used as the anchor line.
       */
      const headerEl = document.querySelector("header");
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : null;
      const headerBottom = headerRect ? headerRect.bottom : 0;
      const headerH = headerRect ? headerRect.height : 0;

      /**
       * Update fades for all sections:
       * These compute opacity values and store them in state.
       */
      aboutFade.update(viewportH, headerBottom, headerH);
      cliffsHeaderFade.update(viewportH, headerBottom, headerH);
      cliffsCardsFade.update(viewportH, headerBottom, headerH);
      cliffsFooterFade.update(viewportH, headerBottom, headerH);
      bottomFade.update(viewportH, headerBottom, headerH);

      /**
       * Hero title opacity:
       * Wait until fonts are ready before starting this behavior to avoid layout shift flicker.
       */
      if (!canFadeTitle) {
        if (titleWrapRef.current) titleWrapRef.current.style.opacity = "1";
        return;
      }

      // If missing refs or header size, just keep title fully visible.
      if (!titleWrapRef.current || headerH <= 0) {
        if (titleWrapRef.current) titleWrapRef.current.style.opacity = "1";
        return;
      }

      /**
       * Compute title fade using the hero title's top position relative to the header.
       */
      const titleTop = titleWrapRef.current.getBoundingClientRect().top;

      /**
       * Hero title fade knobs:
       * - grace: how far below header bottom before fade begins
       * - fadeDistance: how quickly it fades once it starts
       */
      const grace = headerH * 1.25;
      const fadeDistance = headerH * 1.5;

      const fadeStart = headerBottom + grace; // opacity = 1 here
      const fadeEnd = fadeStart - fadeDistance; // opacity = 0 here

      // Normalize into 0..1 for opacity.
      const opacity = clamp01((titleTop - fadeEnd) / (fadeStart - fadeEnd));
      if (titleWrapRef.current) titleWrapRef.current.style.opacity = opacity.toFixed(3);
    };

    /**
     * onScroll:
     * Throttle updates using RAF so we don't run update() on every scroll event synchronously.
     */
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // Run once on mount to initialize all positions/opacity.
    update();

    /**
     * Font readiness:
     * Once fonts are loaded, allow hero title fade to begin.
     */
    const fontSet = document.fonts;
    if (fontSet?.ready) {
      fontSet.ready.then(() => {
        canFadeTitle = true;
        update();
      });
    } else {
      // Fallback in environments where document.fonts isn't available
      setTimeout(() => {
        canFadeTitle = true;
        update();
      }, 50);
    }

    // Attach scroll + resize listeners
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Cleanup listeners + pending RAF on unmount
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [
    // Dependencies are only the stable callbacks so the effect doesn't re-run unnecessarily
    hero.update,
    cliffs.update,
    aboutFade.update,
    cliffsHeaderFade.update,
    cliffsCardsFade.update,
    cliffsFooterFade.update,
    bottomFade.update,
  ]);

  return (
    <main>
      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION (horses background + title + scroll hint)              */}
      {/* ------------------------------------------------------------------ */}
      <section ref={hero.ref} className="relative h-[105vh] sm:h-[140vh] overflow-hidden">

        {/* Parallax image layer: translate in Y based on hero.offset */}
        <div
          ref={hero.layerRef}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Image
            src="/images/horses/bg.jpg"
            alt="Horses background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[30%_37%] sm:object-center"
 // fills container, cropping as needed
          />
        </div>

        {/* Subtle red gradient wash on the background image */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,9,2,0.22),transparent_75%),linear-gradient(to_bottom,rgba(124,9,2,0.10),transparent_35%,rgba(0,0,0,0.60))]" />

        {/* Dark overlay to improve text readability (kept, slightly lighter) */}
        <div className="absolute inset-0 z-10 bg-black/35" />

        {/* Subtle particle field over the horses background */}
        <div className="pointer-events-none absolute inset-0 z-15">
          <CliffsParticles />
        </div>

        {/* Bottom fade into your base background color */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />

        {/* Foreground content */}
        <div className="relative z-20 flex min-h-screen items-start px-8 pt-36 text-white">
          {/* Title block fades based on titleOpacity */}
          <div
            ref={titleWrapRef}
            className="max-w-3xl will-change-[opacity] ml-4 md:ml-10 lg:ml-16"
          >
            <div className="space-y-2">
              <h1 className={`${cinzel.className} text-5xl font-medium md:text-6xl text-white`}>
                Zach Pawelek
              </h1>
              <p className={`${inter.className} text-base font-light text-white md:text-lg`}>
                Developer
              </p>
            </div>
          </div>

          {/* Scroll hint: fades out based on hideScrollHint */}
          <div
            ref={scrollHintRef}
            className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center transition-opacity duration-700"
          >
            <div className={`${inter.className} text-sm uppercase tracking-[0.35em] text-white/85`}>
              Scroll
            </div>
            <div className="mt-2 text-2xl text-white/85 animate-bounce">↓</div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-3 top-1/2 z-40 -translate-y-1/2 sm:right-6">
          <div 
            ref={heroNoticeRef}
            className="pointer-events-auto max-w-50 scale-[0.88] sm:scale-100 origin-right will-change-[opacity,transform]"
            >


            
        
            <ResponsiveNotice variant="dark" />
    </div>
  </div>








      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ABOUT SECTION (fades in/out using aboutFade)                        */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={nextRef}
        className="relative min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white"
      >
        {/* Entire content wrapper is faded by aboutFade.opacity */}
        <div
          ref={aboutFade.ref}
          className="mx-auto max-w-6xl will-change-[opacity]"
        >
          <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl text-center md:text-left`}>
  About Me
</h2>


          <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
            {/* Headshot */}
            <div className="flex justify-center md:justify-start">
              {/* Neutral shadow wrapper (no red glow) */}
              <div className="relative shadow-[0_22px_70px_-35px_rgba(255,255,255,0.25)]">
                {/* Image container (rounding + crop + subtle ring) */}
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
            </div>

            {/* Bio + buttons */}
            <div className="text-center md:text-left">
              <p className={`${inter.className} text-base leading-relaxed text-white/75 md:text-lg`}>
                Hello. I'm Zach.
                <br />
                Welcome to my Personal Website and online Portfolio.
                <br />
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
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

              <p className={`${inter.className} text-base pt-8 pb-2 leading-relaxed text-white/25 md:text-sm md:py-11`}>
                Take a look around and get to know me, and my work, a little bit better!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CLIFFS SECTION (parallax background + top-left header + bottom-right footer) */}
      {/* ------------------------------------------------------------------ */}
      <section ref={cliffs.ref} className="relative h-[140vh] overflow-hidden bg-[rgb(10,10,10)]">
        {/* Parallax image layer: translate in Y based on cliffs.offset */}
        <div
          ref={cliffs.layerRef}
          className="absolute inset-x-0 inset-y-0 z-0 will-change-transform"
        >
          <Image
            src="/images/cliffs.jpg"
            alt="Cliffs background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[55%_58%]" // cover + custom object-position
          />
        </div>

        {/* Subtle red gradient wash on the cliffs background image */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_80%_70%,rgba(124,9,2,0.20),transparent_60%),linear-gradient(to_top,rgba(124,9,2,0.10),transparent_45%)]" />

        {/* Dark overlay for legibility (kept) */}
        <div className="absolute inset-0 z-10 bg-black/35" />

        {/* Top fade into base background */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-44 bg-linear-to-b from-[rgb(10,10,10)] to-transparent" />

        {/* Bottom fade into base background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />

        {/* Foreground overlay spans the full section so we can position text in corners */}





        {/* Foreground overlay: grid ensures header/cards/footer never overlap */}
<div className="absolute inset-0 z-30 px-4 sm:px-8 py-16 sm:py-20 text-white">
  <div className="relative mx-auto h-full max-w-6xl grid grid-rows-[auto,1fr,auto] gap-6">
    {/* Top-left header */}
    <div ref={cliffsHeaderFade.ref} className="relative z-10 will-change-[opacity]">
    <h2 className={`${cinzel.className} text-2xl font-medium md:text-3xl`}>Quick Information</h2>

    </div>

    {/* Cards area (middle row) — scrolls inside on small screens instead of overlapping */}
    <div
      ref={cliffsCardsFade.ref}
      className="relative z-0 min-h-0 overflow-auto lg:overflow-visible will-change-[opacity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex min-h-full items-center justify-center">
      <div className="w-full max-w-4xl transform-gpu origin-center scale-[0.78] sm:scale-[0.87] -translate-y-10 sm:-translate-y-4 lg:translate-y-0">
          <div className="grid gap-4 md:grid-cols-3">


          <GlassCard
  title="Projects"
  kicker="FAQ 1"
  delayMs={0}
  backTitle="Projects"
  backKicker="FAQ 1"
  backChildren={
    <>
      <p className="mt-2 text-sm text-white/75">
        UI/GUI focused builds with API integrated components and features
      </p>

    </>
  }
>
  What kinds of projects will I find here?
</GlassCard>


            <GlassCard
              title="Stack"
              kicker="FAQ 2"
              delayMs={120}
              backTitle="Stack"
              backKicker="FAQ 2"
              backChildren={
                <ul className="mt-2 space-y-2">
                  <li>SQLite3</li>
                  <li>Java</li>
                  <li>HMTL/CSS/JavaScript</li>
                  <li>React Components</li>
                </ul>
              }
            >
              What is in your Tech Stack that you are you proficient in?
            </GlassCard>


            <GlassCard
              title="About"
              kicker="FAQ 3"
              delayMs={240}
              backTitle="About"
              backKicker="FAQ 3"
              backChildren={
                <ul className="mt-2 space-y-2">
                  <li>Zach Pawelek</li>
                  <li>Milwaukee, WI</li>
                  <li>Senior at Arizona State University</li>
                </ul>
              }
            >
              Who are you, and where are you from?
            </GlassCard>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <GlassCard
              title="Contact"
              kicker="FAQ 4"
              delayMs={360}
              backTitle="Contact"
              backKicker="FAQ 4"
              backChildren={
                <ul className="mt-2 space-y-2">
                  <li>Contact me via zachpawelek@gmail.com</li>
                  <li>Subscribe to my Newsletter on this site!</li>
                  
                </ul>
              }
            >
            How can I quickly get in touch with you? 
            </GlassCard>

            <GlassCard
              title="Website"
              kicker="FAQ 5"
              delayMs={480}
              backTitle="Website"
              backKicker="FAQ 5"
              backChildren={
                <ul className="mt-2 space-y-2">
                  <li>A personalized portfolio showcasing all of my work</li>
                  <li>Get to know me better and network with me!</li>
                  
                </ul>
              }
            >
            What is the purpose of this site? 
            </GlassCard>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom-right footer */}
    <div
      ref={cliffsFooterFade.ref}
      className="pointer-events-none z-10 text-right will-change-[opacity] justify-self-end"
    >
   <div className={`${inter.className} text-[10px] uppercase tracking-[0.35em]`}>FAQ's & </div>
<div className={`${cinzel.className} mt-2 text-xl font-medium md:text-2xl`}>Welcome To My Page</div>

    </div>
  </div>
</div>

        </section>
  
        {/* ------------------------------------------------------------------ */}
        {/* BOTTOM SECTION (newsletter) — fades IN only (no fade-out)            */}
        {/* ------------------------------------------------------------------ */}
        <section className="relative bg-[rgb(10,10,10)] px-8 py-20 pb-32 text-white">
          {/* Subtle top fade so it transitions nicely from above */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />
  
          {/* Entire content wrapper fades IN only via bottomFade (fadeOut: false) */}
          <div
            ref={bottomFade.ref}
            className="relative z-20 mx-auto max-w-6xl will-change-[opacity]"
          >
            <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl text-center`}>
              Stay Up To Date
            </h2>
  
            <p
              className={`${inter.className} mt-3 mx-auto max-w-2xl text-center text-sm leading-relaxed text-white/70 md:text-lg`}
            >
              Occasional updates on my new projects, contributions, and what I’m building. 
              <br>
              </br>
              No spam. Ever.
            </p>
  
            {/* Two-column layout on desktop */}
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {/* Left card: newsletter signup */}
              <div
                className={[
                  "group relative overflow-hidden",
                  "rounded-2xl border border-neutral-800 bg-neutral-950/40",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/55",
                  "hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
                  "focus-within:-translate-y-0.5 focus-within:border-neutral-700 focus-within:bg-neutral-950/55",
                  "focus-within:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
                  "focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 focus-within:ring-offset-neutral-950",
                  "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
                  "after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent",
                  "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",
                ].join(" ")}
              >
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl bg-[radial-gradient(circle,rgba(124,9,2,0.18),transparent_65%)]" />
  
                <div className="relative p-8">
                  <div
                    className={`${inter.className} text-xs uppercase tracking-[0.35em]`}
                    style={{ color: "#7c0902" }}
                  >
                    Newsletter
                  </div>
  
                  <h3 className={`${cinzel.className} mt-3 text-2xl font-medium md:text-3xl`}>
                    Subscribe for updates
                  </h3>
  
                  <p className={`${inter.className} mt-4 text-base leading-relaxed text-white/70`}>
                    Get a short email containing my newsletter. Unsubscribe anytime.
                  </p>
  
                  <form className="mt-6 space-y-3" onSubmit={onSubscribe}>
                    <label className="block">
                      <span
                        className={`${inter.className} text-xs uppercase tracking-wide text-neutral-500`}
                      >
                        Email
                      </span>
                      <input
                        type="email"
                        required
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                      />
                    </label>
  
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={subStatus === "loading"}
                        className="inline-flex items-center justify-center rounded-xl border border-neutral-800 px-5 py-2.5 text-sm font-medium text-white transition-transform duration-200 transform hover:scale-105 active:scale-100 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 disabled:opacity-60"
                        style={{ backgroundColor: "#7c0902" }}
                      >
                        {subStatus === "loading" ? "Subscribing..." : "Subscribe"}
                      </button>
  
                      <div className={`${inter.className} text-xs text-white/50 text-center sm:text-left sm:flex-1`}>
                        By subscribing, you agree to receive emails from me.
                      </div>
                    </div>
  
                    {subMsg ? (
                      <div
                        className={`${inter.className} text-sm ${
                          subStatus === "error" ? "text-red-300" : "text-white/70"
                        }`}
                      >
                        {subMsg}
                      </div>
                    ) : null}
                  </form>
                </div>
              </div>
  
              {/* Right card: what to expect */}
              <div
                className={[
                  "group relative overflow-hidden",
                  "rounded-2xl border border-neutral-800 bg-neutral-950/40 p-8",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/55",
                  "hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
                  "focus-within:-translate-y-0.5 focus-within:border-neutral-700 focus-within:bg-neutral-950/55",
                  "focus-within:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
                  "focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 focus-within:ring-offset-neutral-950",
                  "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
                  "after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent",
                  "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",
                ].join(" ")}
              >
                <h4 className={`${cinzel.className} text-xl font-medium text-center md:text-left`}>
  What you’ll get
</h4>

  
                <ul className={`${inter.className} mt-5 space-y-3 text-white/70`}>
                  <li className="flex items-start gap-3">
                    <span
                      className="mt-1 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "#7c0902" }}
                    />
                    New projects
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="mt-1 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "#7c0902" }}
                    />
                    Latest Newsletter with tiny coding excercises
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="mt-1 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: "#7c0902" }}
                    />
                    My current Study Habits + Tips!
                  </li>
                </ul>
  
                <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
                  <div className={`${inter.className} text-sm text-white/70`}>Frequency: </div>
                  <div className={`${inter.className} mt-1 text-sm text-white/50`}>
                    Usually 1–2 emails per month.
                  </div>
                </div>
              </div>
            </div>
  
            {/* Tiny footer marker */}
            <div
              className={`${inter.className} mt-16 text-center text-xs tracking-[0.35em] text-white/35`}
            >
              FOLLOW ME
            </div>
  
            <SocialLinks />
          </div>
        </section>
      </main>
    );
  }
  
