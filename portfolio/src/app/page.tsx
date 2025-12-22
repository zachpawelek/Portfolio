"use client"; // Next.js App Router directive: this file runs on the client (uses hooks like useState/useEffect)

import Image from "next/image"; // Optimized image component
import React, { useCallback, useEffect, useRef, useState } from "react"; // React hooks
import { cinzel, inter } from "@/lib/fonts"; // Your custom font objects
import SocialLinks from "@/components/footer/SocialLinks";
import CliffsParticles from "@/components/home/CliffsParticles";
import GlassCard from "@/components/home/GlassCard";

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
function useParallax<T extends HTMLElement>(strength = 140) {
  const ref = useRef<T | null>(null); //  ref attached to the section we want to parallax
  const [offset, setOffset] = useState(0); // computed parallax translate value (in px)

  /**
   * strengthRef:
   * We store strength in a ref so you can change the strength prop without recreating update().
   * update() stays stable, but uses the latest strength value.
   */
  const strengthRef = useRef(strength);
  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  /**
   * update(viewportH)
   * Called by your main RAF loop on scroll/resize.
   * Computes the parallax offset based on how far the element has progressed through the viewport.
   */
  const update = useCallback((viewportH: number) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    /**
     * progress:
     * A normalized value that represents how far the section has traveled through the viewport.
     * - When rect.top is high (below viewport), progress is smaller.
     * - When rect.top goes negative (scrolled up), progress increases.
     */
    const progress = (viewportH - rect.top) / (viewportH + rect.height);

    // Clamp into 0..1 so we get stable bounds.
    const p = clamp01(progress);

    /**
     * offset formula:
     * p is 0..1 -> (p - 0.5) becomes -0.5..0.5
     * Multiply by strength to get a pixel translate range.
     * Example: strength 140 => -70..+70px.
     */
    setOffset((p - 0.5) * strengthRef.current);
  }, []);

  return { ref, offset, update }; // ✅ used by the caller to attach ref + apply offset
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
  const ref = useRef<T | null>(null); // ✅ attach to the element you want to fade
  const [opacity, setOpacity] = useState(1); // ✅ computed opacity output

  /**
   * Default tuning values:
   * These are chosen to feel similar to your hero fade vibe.
   * You override these per element by passing opts.
   */
  const enterStartMult = opts?.enterStartMult ?? 0.9;
  const enterEndMult = opts?.enterEndMult ?? 0.6;
  const graceMult = opts?.graceMult ?? 2.75;
  const fadeDistMult = opts?.fadeDistMult ?? 3.5;
  const fadeOut = opts?.fadeOut ?? true;

  /**
   * update(viewportH, headerBottom, headerH)
   * Called by your main RAF loop.
   * Outputs a single opacity value that combines:
   * - enter (fade-in) AND
   * - exit (fade-out, optional)
   */
  const update = useCallback(
    (viewportH: number, headerBottom: number, headerH: number) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();

      /**
       * ----------------------------
       * FADE IN (ENTER) CALCULATION
       * ----------------------------
       * We use rect.top so it starts fading in when the top of the block
       * approaches the bottom-ish portion of the viewport.
       *
       * enterStart: where fade-in starts (opacity ~0)
       * enterEnd: where fade-in ends (opacity ~1)
       *
       * enter = 0..1
       */
      const enterStart = viewportH * enterStartMult;
      const enterEnd = viewportH * enterEndMult;
      const enter = clamp01((enterStart - rect.top) / (enterStart - enterEnd));

      /**
       * ----------------------------
       * FADE OUT (EXIT) CALCULATION
       * ----------------------------
       * Optional: disabled if fadeOut === false.
       *
       * We build a "fade zone" near the header:
       * - fadeStart: point where opacity should still be 1
       * - fadeEnd: point where opacity should reach 0
       *
       * Using headerH multiples makes it responsive to different header sizes.
       */
      let exit = 1;
      if (fadeOut && headerH > 0) {
        const grace = headerH * graceMult; // ✅ start fading later if this is larger
        const fadeDistance = headerH * fadeDistMult; // ✅ fade slower if this is larger

        const fadeStart = headerBottom + grace; // opacity = 1
        const fadeEnd = fadeStart - fadeDistance; // opacity = 0

        /**
         * anchorY:
         * Using rect.bottom delays fade-out for tall sections.
         * (If you used rect.top, tall sections would start fading too early.)
         */
        const anchorY = rect.bottom;

        // exit is 0..1: 1 outside the zone, decreasing to 0 through the zone.
        exit = clamp01((anchorY - fadeEnd) / (fadeStart - fadeEnd));
      }

      /**
       * Final opacity is the product:
       * - Must have entered (enter) AND not yet exited (exit).
       */
      setOpacity(enter * exit);
    },
    [enterStartMult, enterEndMult, graceMult, fadeDistMult, fadeOut]
  );

  return { ref, opacity, update };
}

export default function Home() {
  /**
   * Parallax controllers:
   * hero -> horses background section
   * cliffs -> cliffs background section
   */
  const hero = useParallax<HTMLElement>(140);
  const cliffs = useParallax<HTMLElement>(140);

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

  // ✅ Glass cards layer in cliffs (fills dead space, fades in/out)
  const cliffsCardsFade = useScrollFade<HTMLDivElement>({
    enterStartMult: 0.96,
    enterEndMult: 0.76,
    graceMult: 3.25,
    fadeDistMult: 3.1,
  });

  // Bottom-right footer: fades in later and fades out later than the cliffs header.
  const cliffsFooterFade = useScrollFade<HTMLDivElement>({
    enterStartMult: 0.98, // ✅ fade-in starts lower in the viewport (later)
    enterEndMult: 0.78, // ✅ fade-in reaches full opacity later
    graceMult: 3.25, // ✅ fade-out starts later (closer to header)
    fadeDistMult: 3.0, // ✅ fade-out duration tuning
  });

  // Bottom-of-page section: fade-in only (no fade-out so it doesn't disappear at the end)
  const bottomFade = useScrollFade<HTMLDivElement>({
    fadeOut: false, // ✅ disables fade-out
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

  // Controls the scroll hint visibility
  const [hideScrollHint, setHideScrollHint] = useState(false);

  // Controls hero title opacity
  const [titleOpacity, setTitleOpacity] = useState(1);

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
  useEffect(() => {
    let raf = 0;
    let canFadeTitle = false; // ✅ gate hero title fade until fonts settle

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
      setHideScrollHint(heroProgress > 0.2);

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
        setTitleOpacity(1);
        return;
      }

      // If missing refs or header size, just keep title fully visible.
      if (!titleWrapRef.current || headerH <= 0) {
        setTitleOpacity(1);
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
      setTitleOpacity(opacity);
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
      <section ref={hero.ref} className="relative h-[140vh] overflow-hidden">
        {/* Parallax image layer: translate in Y based on hero.offset */}
        <div
          className="absolute inset-0 z-0 will-change-transform"
          style={{ transform: `translate3d(0, ${hero.offset}px, 0)` }}
        >
          <Image
            src="/images/horses/bg.jpg"
            alt="Horses background"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover" // fills container, cropping as needed
          />
        </div>

        {/* ✅ Subtle red gradient wash on the background image */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(124,9,2,0.22),transparent_55%),linear-gradient(to_bottom,rgba(124,9,2,0.10),transparent_45%,rgba(0,0,0,0.60))]" />

        {/* Dark overlay to improve text readability (kept, slightly lighter) */}
        <div className="absolute inset-0 z-10 bg-black/35" />

        {/* ✅ Subtle particle field over the horses background */}
        <div className="pointer-events-none absolute inset-0 z-[15]">
          <CliffsParticles />
        </div>

        {/* Bottom fade into your base background color */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />

        {/* Foreground content */}
        <div className="relative z-20 flex min-h-screen items-start px-8 pt-36 text-white">
          {/* Title block fades based on titleOpacity */}
          <div
            ref={titleWrapRef}
            style={{ opacity: titleOpacity }}
            className="max-w-3xl will-change-[opacity]"
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
          style={{ opacity: aboutFade.opacity }}
          className="mx-auto max-w-6xl will-change-[opacity]"
        >
          <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>About Me</h2>

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
            <div>
              <p className={`${inter.className} text-base leading-relaxed text-white/75 md:text-lg`}>
                Hello. I'm Zach.
                <br />
                Welcome to my Personal Website and online Portfolio.
                <br />
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

              <p className={`${inter.className} text-base py-11 leading-relaxed text-white/25 md:text-sm`}>
                Take a Look around and get to know me, and my work, a little bit better!
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
          className="absolute inset-x-0 inset-y-0 z-0 will-change-transform"
          style={{ transform: `translate3d(0, ${cliffs.offset}px, 0)` }}
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

        {/* ✅ Subtle red gradient wash on the cliffs background image */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_80%_70%,rgba(124,9,2,0.20),transparent_60%),linear-gradient(to_top,rgba(124,9,2,0.10),transparent_45%)]" />

        {/* Dark overlay for legibility (kept) */}
        <div className="absolute inset-0 z-10 bg-black/35" />

        {/* Top fade into base background */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-44 bg-linear-to-b from-[rgb(10,10,10)] to-transparent" />

        {/* Bottom fade into base background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-b from-transparent to-[rgb(10,10,10)]" />

        {/* Foreground overlay spans the full section so we can position text in corners */}
        <div className="absolute inset-0 z-30 px-8 py-20 text-white">
          <div className="relative mx-auto h-full max-w-6xl">
            {/* Top-left header: fades using cliffsHeaderFade */}
            <div
              ref={cliffsHeaderFade.ref}
              style={{ opacity: cliffsHeaderFade.opacity }}
              className="relative z-10 will-change-[opacity]"
            >
              <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
                Another Section
              </h2>
            </div>



            {/* ✅ Glass cards (fills the previous particle "dead space", fades in/out) */}
<div
  ref={cliffsCardsFade.ref}
  style={{ opacity: cliffsCardsFade.opacity }}
  className="absolute inset-0 z-0 flex items-center justify-center px-4 will-change-[opacity]"
>
<div className="w-full max-w-4xl transform-gpu origin-center scale-[0.87]">
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard
        title="Fast"
        kicker="Performance"
        delayMs={0}
        backTitle="How I keep it fast"
        backKicker="What I focus on"
        backChildren={
          <ul className="mt-2 space-y-2">
            <li>GPU-friendly transforms (translate3d)</li>
            <li>RAF-throttled scroll updates</li>
            <li>Minimal re-renders (stable callbacks)</li>
            <li>Optimized images &amp; sensible priorities</li>
          </ul>
        }
      >
        Lightweight UI, smooth parallax, and buttery transitions—focused on feel and clarity.
      </GlassCard>

      <GlassCard
        title="Modern"
        kicker="Stack"
        delayMs={120}
        backTitle="Core tools"
        backKicker="What this site uses"
        backChildren={
          <ul className="mt-2 space-y-2">
            <li>Next.js App Router</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Reusable components + clean structure</li>
          </ul>
        }
      >
        Next.js App Router, Tailwind, and clean component structure designed to scale.
      </GlassCard>

      <GlassCard
        title="Polished"
        kicker="UX"
        delayMs={240}
        backTitle="UX details"
        backKicker="Design choices"
        backChildren={
          <ul className="mt-2 space-y-2">
            <li>Readable typography + spacing</li>
            <li>Subtle motion (no chaos)</li>
            <li>High contrast on image sections</li>
            <li>Hover/focus parity for accessibility</li>
          </ul>
        }
      >
        Subtle motion, readable typography, and intentional layout—no clutter, no noise.
      </GlassCard>
    </div>

    <div className="mt-5 grid gap-5 md:grid-cols-2">
      <GlassCard
        title="Projects"
        kicker="Featured"
        delayMs={360}
        backTitle="What you'll find"
        backKicker="Project highlights"
        backChildren={
          <ul className="mt-2 space-y-2">
            <li>Full-stack builds + UI work</li>
            <li>Performance-minded implementations</li>
            <li>Clean code + maintainability</li>
            <li>Links, demos, and write-ups</li>
          </ul>
        }
      >
        Highlight key builds here with links, stats, or tech bullets.
      </GlassCard>

      <GlassCard
        title="Contact"
        kicker="Let’s build"
        delayMs={480}
        backTitle="Reach out"
        backKicker="Best ways to connect"
        backChildren={
          <ul className="mt-2 space-y-2">
            <li>Email me with an idea or role</li>
            <li>Use the contact form for quick notes</li>
            <li>Check socials for recent updates</li>
            <li>Happy to talk collaboration</li>
          </ul>
        }
      >
        Add a CTA, email, or a button to your contact page.
      </GlassCard>
    </div>
  </div>
</div>



            {/* Bottom-right footer: fades using cliffsFooterFade, later than the header */}
            <div
              ref={cliffsFooterFade.ref}
              style={{ opacity: cliffsFooterFade.opacity }}
              className="pointer-events-none absolute bottom-6 right-0 z-10 text-right will-change-[opacity]"
            >
              {/* Accent color: set via style because Tailwind can't do text-#HEX directly */}
              <div className={`${inter.className} text-xs uppercase tracking-[0.35em]`}>
                Footer Label
              </div>

              <div className={`${cinzel.className} mt-2 text-2xl font-medium md:text-3xl`}>
                Bottom Right Text
              </div>
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
          style={{ opacity: bottomFade.opacity }}
          className="relative z-20 mx-auto max-w-6xl will-change-[opacity]"
        >
          <h2 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Stay Up To Date
          </h2>

          <p
            className={`${inter.className} mt-3 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg`}
          >
            Occasional updates on my new projects, contributions, and what I’m building. No spam.
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

                    <div className={`${inter.className} text-xs text-white/50`}>
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
              <h4 className={`${cinzel.className} text-xl font-medium`}>What you’ll get</h4>

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
                  Dev notes &amp; small experiments
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "#7c0902" }}
                  />
                  Occasional links + tools I’m liking
                </li>
              </ul>

              <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-5">
                <div className={`${inter.className} text-sm text-white/70`}>Frequency</div>
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
