import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";
import LifeCarousel from "./LifeCarousel";
import SocialLinks from "@/components/footer/SocialLinks";

export const metadata: Metadata = {
  title: "About",
  description: "A bit about me, what I do, and what I like building.",
};

const ACCENT = "#7c0902";

function env(name: string, fallback = "") {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

export default function AboutPage() {
  const displayName = env("NEXT_PUBLIC_NAME", "Zach");
  const location = env("NEXT_PUBLIC_LOCATION", "Chicago, IL");
  const role = env("NEXT_PUBLIC_ROLE", "Full-stack developer");
  const githubUrl = env("NEXT_PUBLIC_GITHUB_URL", "");
  const linkedinUrl = env("NEXT_PUBLIC_LINKEDIN_URL", "");

  // Drop 6–10 images into: public/images/life/
  // Then update these filenames to match.
  const lifePhotos = [
    { src: "/images/life/01.jpeg", alt: "Personal photo 1" },
    { src: "/images/life/02.jpeg", alt: "Personal photo 2" },
    { src: "/images/life/03.jpeg", alt: "Personal photo 3" },
    { src: "/images/life/04.jpeg", alt: "Personal photo 4" },
    { src: "/images/life/05.jpeg", alt: "Personal photo 5" },
    // add up to 10 if you want:
    // { src: "/images/life/07.jpg", alt: "Personal photo 7" },
    // { src: "/images/life/08.jpg", alt: "Personal photo 8" },
    // { src: "/images/life/09.jpg", alt: "Personal photo 9" },
    // { src: "/images/life/10.jpg", alt: "Personal photo 10" },
  ];

  return (
    <main className="relative">
      {/* Page-wide subtle glows (kept) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div className="absolute top-64 left-10 h-60 w-60 rounded-full bg-neutral-200/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-neutral-200/5 blur-3xl" />
        <div
          className="absolute -top-10 right-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(124, 9, 2, 0.10)" }}
        />
      </div>

      {/* Cinematic hero using AZCliffs.jpg */}
      <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center">
        {/* Background image + overlays */}
        <div className="absolute inset-0">
          <Image
            src="/images/AZCliffs.jpg"
            alt={`${displayName} in nature`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[55%_70%]! will-change-transform scale-[1.3] -translate-x-[-9%]"
          />

          {/* Base darken */}
          <div className="absolute inset-0 bg-black/35" />
          {/* Legibility gradient (left rail for text) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          {/* Subtle accent tint to match your theme */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(124, 9, 2, 0.10)" }}
          />
        </div>

        {/* Hero content */}
        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <Reveal>
            <header className="max-w-2xl">
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                About
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Hey, I’m {displayName}.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
                I’m a {role} based in {location}. I like building polished UIs, thoughtful product
                experiences, and reliable APIs that hold up in production.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur
                             hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Contact →
                </Link>

                <Link
                  href="/projects"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur
                             hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Projects →
                </Link>

                {githubUrl ? (
                  <Link
                    href={githubUrl}
                    target="_blank"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur
                               hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    GitHub →
                  </Link>
                ) : null}

                {linkedinUrl ? (
                  <Link
                    href={linkedinUrl}
                    target="_blank"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur
                               hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    LinkedIn →
                  </Link>
                ) : null}
              </div>

              {/* Optional: small location chip (helps “anchor” the hero) */}
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                {location}
              </div>
            </header>
          </Reveal>
        </div>

        {/* Soft fade into the page below */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-neutral-950" />
      </section>

      {/* Rest of your About content */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4">
            <Reveal delay={0}>
              <Card title="What I care about">
                <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-neutral-300">
                  <li>
                    <span className="text-neutral-200">Craft:</span> responsive, accessible UI that
                    feels intentional.
                  </li>
                  <li>
                    <span className="text-neutral-200">Reliability:</span> clean data flows, sensible
                    validation, predictable behavior.
                  </li>
                  <li>
                    <span className="text-neutral-200">Performance:</span> fast pages, smart loading,
                    and avoiding “unnecessary work.”
                  </li>
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={80}>
              <Card title="Tech I reach for">
                <div className="flex flex-wrap gap-2">
                  <Pill>Next.js</Pill>
                  <Pill>TypeScript</Pill>
                  <Pill>React</Pill>
                  <Pill>Tailwind</Pill>
                  <Pill>Supabase</Pill>
                  <Pill>Postgres</Pill>
                  <Pill>Vercel</Pill>
                  <Pill>Resend</Pill>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  (Swap these to match your real stack — keep it honest + specific.)
                </p>
              </Card>
            </Reveal>

            <Reveal delay={160}>
              <Card title="Now">
                <div className="space-y-3">
                  <TimelineItem
                    dotColor={ACCENT}
                    title="Building portfolio features"
                    body="Polishing pages, adding real-world backend pieces, and shipping quickly."
                  />
                  <TimelineItem
                    dotColor={ACCENT}
                    title="Improving UX details"
                    body="Loading states, form feedback, accessibility, and responsive layouts."
                  />
                  <TimelineItem
                    dotColor={ACCENT}
                    title="Staying curious"
                    body="Trying new tools and patterns, but keeping the basics strong."
                  />
                </div>
              </Card>
            </Reveal>
          </section>

          <section className="space-y-4">
            <Reveal delay={40}>
              <Card title="A little more detail">
                <p className="text-sm leading-6 text-neutral-300">
                  I enjoy projects where product and engineering overlap — places where the UI needs
                  to feel great, and the backend needs to be dependable. I’m especially interested in
                  building features end-to-end: schema → API → UI → deployment.
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Outside of coding, I like to recharge with whatever keeps me grounded and curious —
                  learning, reading, and exploring new ideas.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={120}>
              <Card title="Highlights">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniStat label="Strength" value="UI polish" />
                  <MiniStat label="Also strong at" value="API design" />
                  <MiniStat label="I like" value="Shipping" />
                  <MiniStat label="I avoid" value="Over-engineering" />
                </div>
              </Card>
            </Reveal>

            <Reveal delay={200}>
              <Card title="What I’m looking for">
                <ul className="space-y-2 text-sm leading-6 text-neutral-300">
                  <li>• Frontend-leaning full-stack work</li>
                  <li>• Products with real users + feedback loops</li>
                  <li>• Teams that care about quality and iteration</li>
                </ul>
                <div className="mt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                  >
                    Let’s talk →
                  </Link>
                </div>
              </Card>
            </Reveal>
          </section>
        </div>

        {/* NEW: Personal-life photo carousel near bottom */}
        <Reveal delay={240}>
          <div className="mt-12">
            <Card title="Life outside of code">
              <p className="text-sm leading-6 text-neutral-300">
                A few snapshots from my life — hikes, friends, weekends, whatever I’m into lately.
              </p>

              <LifeCarousel images={lifePhotos} accent={ACCENT} className="mt-5" />
            </Card>
          </div>
        </Reveal>

        <div className="mt-16 text-center text-xs tracking-[0.35em] text-white/35">FOLLOW ME</div>
        <SocialLinks />
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className={[
        "group relative overflow-hidden",
        "rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/55",
        "hover:shadow-[0_0_40px_rgba(124,9,2,0.10)]",
        "focus-within:-translate-y-0.5 focus-within:border-neutral-700 focus-within:bg-neutral-950/55",
        "focus-within:shadow-[0_0_40px_rgba(124,9,2,0.10)]",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 focus-within:ring-offset-neutral-950",
        "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
        "after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent",
        "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",
      ].join(" ")}
    >
      <h2 className="text-sm font-medium text-neutral-100">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:bg-neutral-900/60",
        "hover:shadow-[0_0_24px_rgba(124,9,2,0.10)]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={[
        "rounded-xl border border-neutral-800 bg-neutral-950/50 p-4",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/60",
        "hover:shadow-[0_0_28px_rgba(124,9,2,0.08)]",
      ].join(" ")}
    >
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function TimelineItem({
  title,
  body,
  dotColor,
}: {
  title: string;
  body: string;
  dotColor: string;
}) {
  return (
    <div className="relative pl-5">
      <div
        className="absolute left-0 top-2 h-2 w-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      <p className="text-sm text-neutral-200">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{body}</p>
    </div>
  );
}
