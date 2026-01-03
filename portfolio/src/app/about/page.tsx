import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "./Reveal";
import LifeCarousel from "./LifeCarousel";
import SocialLinks from "@/components/footer/SocialLinks";
import ScrollHintArrow from "@/components/ui/ScrollHintArrow";

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
  const location = env("NEXT_PUBLIC_LOCATION", "Milwaukee, Wisconsin");
  const role = env("NEXT_PUBLIC_ROLE", "Software Engineering Student");
  const githubUrl = env("NEXT_PUBLIC_GITHUB_URL", "");
  const linkedinUrl = env("NEXT_PUBLIC_LINKEDIN_URL", "");

  const lifePhotos = [
    { src: "/images/life/01.jpeg", alt: "Hiking" },
    { src: "/images/life/02.jpeg", alt: "Hiking" },
    { src: "/images/life/03.jpeg", alt: "Pup!" },
    { src: "/images/life/04.jpeg", alt: "Hiking" },
    { src: "/images/life/05.jpeg", alt: "Photography" },
  ];

  return (
    <main className="relative">
      {/* Page-wide subtle glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div className="absolute top-64 left-10 h-60 w-60 rounded-full bg-neutral-200/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-neutral-200/5 blur-3xl" />
        <div
          className="absolute -top-10 right-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(124, 9, 2, 0.10)" }}
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden h-[100svh] md:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/AZCliffs.jpg"
            alt={`${displayName} in nature`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[55%_70%]! will-change-transform scale-[1.3] -translate-x-[-9%]"
          />

          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(124,9,2,0.22),transparent_45%),linear-gradient(to_bottom,rgba(124,9,2,0.10),transparent_45%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <Reveal>
            <header className="max-w-2xl text-center md:text-left mx-auto md:mx-0 -translate-y-6 md:translate-y-0">
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
                I’m a 26 year old {role} living in {location}.
                <br></br>
              </p>

              <div className="mt-6 md:mt-7 flex flex-wrap gap-3 justify-center md:justify-start">
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

              <div className="hidden md:inline-flex mt-8 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70 backdrop-blur md:mx-0">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                {location}
              </div>
            </header>
          </Reveal>
        </div>

        <ScrollHintArrow />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-b from-transparent to-neutral-950" />
      </section>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6">
        <div className="grid items-stretch gap-8 md:grid-cols-2">
          {/* Education */}
          <Reveal delay={0} className="md:h-full">
            <Card title="Education History">
              {/* ✅ MOBILE: includes ALL schools */}
              <ul className="list-disc list-outside pl-5 space-y-3 text-sm leading-6 text-neutral-300 md:hidden">
                <li>
                  <span className="text-neutral-200">Arizona State University</span> — B.S. Software
                  Engineering
                  <span className="text-neutral-400 whitespace-nowrap"> (2022–2026)</span>
                  <div className="mt-1 text-xs text-neutral-500">
                    Data Structures • Algorithms • Databases • Software Engineering
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Capstone: AI Tutor (React Native / Expo)
                  </div>
                </li>

                <li>
                  <span className="text-neutral-200">William Rainey Harper College</span> —
                  Prerequisite Coursework
                  <span className="text-neutral-400 whitespace-nowrap"> (2019–2020)</span>
                  <div className="mt-1 text-xs text-neutral-500">
                    General Studies • Graphic Design • Web Design • Adobe Suite
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Received Phi Theta Kappa Honor
                  </div>
                </li>

                <li>
                  <span className="text-neutral-200">Harvest Christian Academy</span> — High School
                  <span className="text-neutral-400 whitespace-nowrap"> (2014–2018)</span>
                  <div className="mt-1 text-xs text-neutral-500">Graduated with 3.9 GPA</div>
                </li>
              </ul>

              {/* ✅ DESKTOP ONLY: your structured timeline */}
              <div className="hidden md:block">
                <div className="space-y-5">
                  {/* Entry 1 */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-100 truncate">
                          Arizona State University
                        </p>
                        <p className="mt-1 text-sm text-neutral-300">
                          B.S. Computer Science <span className="text-neutral-500">• Tempe, AZ</span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Years</p>
                        <p className="mt-1 text-sm text-neutral-200">2022 — 2026</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Data Structures
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Algorithms
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Databases
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Software Engineering
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-neutral-400">
                      <div className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[rgba(124,9,2,0.9)]" />
                        <span>Capstone: AI Tutor (React Native / Expo)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[rgba(124,9,2,0.9)]" />
                        <span>Set to Graduate in May, 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Entry 2 */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-100 truncate">
                          William Rainey Harper College
                        </p>
                        <p className="mt-1 text-sm text-neutral-300">
                          Prerequesite Coursework{" "}
                          <span className="text-neutral-500">Palatine, IL</span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Years</p>
                        <p className="mt-1 text-sm text-neutral-200">2019 — 2020</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        General Studies
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Graphic Design
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Web Design
                      </span>
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        Adobe Suite
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-neutral-400">
                      <div className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[rgba(124,9,2,0.9)]" />
                        <span>Received Phi Theta Kappa Honor</span>
                      </div>
                    </div>
                  </div>

                  {/* Entry 3 */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-100 truncate">
                          Harvest Christian Academy
                        </p>
                        <p className="mt-1 text-sm text-neutral-300">
                          High School <span className="text-neutral-500">Elgin, IL</span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs uppercase tracking-wide text-neutral-500">Years</p>
                        <p className="mt-1 text-sm text-neutral-200">2014 — 2018</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-0.5 text-xs text-neutral-200">
                        General Studies
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-xs text-neutral-400">
                      <div className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[rgba(124,9,2,0.9)]" />
                        <span>Graduated With 3.9 GPA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Get to know me */}
          <Reveal delay={0} className="md:h-full">
            <Card title="Get to Know me...">
              <p className="text-sm leading-6 text-neutral-300">
                I am a 26 year old Senior attending Arizona State University, with only 6 credit hours
                remaining until graduation.
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                With a background in freelance Graphic Design, I stepped into the world of
                programming to combine my passion for desinging, building, creating.
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Outside of code, I love to travel, hike, and explore all that nature has to offer.
              </p>

              {/* Mobile */}
              <div className="mt-4 md:hidden overflow-hidden rounded-xl border border-neutral-800">
                <div className="relative aspect-video w-full">
                  <Image
                    src="/images/headshot.jpg"
                    alt="Hiking/travel"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Desktop */}
              <div className="mt-4 hidden md:block overflow-hidden rounded-xl border border-neutral-800">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/headshot.jpg"
                    alt="Hiking/travel"
                    fill
                    sizes="520px"
                    className="object-cover"
                  />
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={80} className="md:h-full">
            <Card title="Current tech stack I'm working with">
              <div className="flex flex-wrap gap-2">
                <Pill>Next.js</Pill>
                <Pill>TypeScript</Pill>
                <Pill>React</Pill>
                <Pill>Tailwind</Pill>
                <Pill>Supabase</Pill>
                <Pill>Postgres</Pill>
                <Pill>Vercel</Pill>
                <Pill>Resend</Pill>
                <Pill>Expo</Pill>
              </div>
              <p className="mt-3 text-xs text-neutral-500">I'm always seeking to learn!</p>
            </Card>
          </Reveal>

          <Reveal delay={80} className="md:h-full">
            <Card title="Languages">
              <div className="grid gap-3 sm:grid-cols-2">
                <MiniStat label="Strength" value="Java" />
                <MiniStat label="Also strong at" value="JavaScript/Typescript" />
                <MiniStat label="Improving my skills with" value="Python" />
                <MiniStat label="Beginning to Learn" value="C/C++" />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={160} className="md:h-full">
            <Card title="What I'm doing now">
              <div className="space-y-3">
                <TimelineItem
                  dotColor={ACCENT}
                  title="Building portfolio features"
                  body="Polishing pages, adding API focused backend pieces."
                />
                <TimelineItem
                  dotColor={ACCENT}
                  title="Improving UX details"
                  body="Reducing Latency, Minimizing Site loading times, Improving form feedback."
                />
                <TimelineItem
                  dotColor={ACCENT}
                  title="Staying curious"
                  body="Trying new tools and patterns, but keeping the basics strong."
                />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={160} className="md:h-full">
            <Card title="What I’m looking for">
              <ul className="space-y-2 text-sm leading-6 text-neutral-300">
                <li>• Frontend-leaning full-stack work</li>
                <li>• Products with real users + stakeholder feedback</li>
                <li>• Team-oriented Projects that ensure quality</li>
              </ul>
              <div className="mt-4 flex justify-center md:justify-start">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Let’s talk →
                </Link>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* Life carousel */}
        <Reveal delay={240}>
          <div className="mt-12">
            <Card title="Life Outside Of Code" noHoverTint>
              <p className="text-sm leading-6 text-neutral-300 text-center md:text-left">
                Take a peek into my life — hiking, friends, traveling!
              </p>

              <LifeCarousel images={lifePhotos} accent={ACCENT} className="mt-4" density="compact" />
            </Card>
          </div>
        </Reveal>

        <div className="mt-16 text-center text-xs tracking-[0.35em] text-white/35">FOLLOW ME</div>
        <SocialLinks />
      </div>
    </main>
  );
}

function Card({
  title,
  children,
  noHoverTint,
  className,
}: {
  title: string;
  children: React.ReactNode;
  noHoverTint?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        // ✅ Mobile grows naturally; desktop keeps equal-height behavior + clipped shimmer
        "group relative w-full h-auto md:h-full overflow-visible md:overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5",
        "flex flex-col",
        "transition-all duration-300 ease-out",

        "hover:-translate-y-0.5 hover:border-neutral-700",
        noHoverTint ? "hover:bg-neutral-950/40" : "hover:bg-neutral-950/55",
        "hover:shadow-[0_0_40px_rgba(124,9,2,0.10)]",

        "focus-within:-translate-y-0.5 focus-within:border-neutral-700",
        noHoverTint ? "focus-within:bg-neutral-950/40" : "focus-within:bg-neutral-950/55",
        "focus-within:shadow-[0_0_40px_rgba(124,9,2,0.10)]",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 focus-within:ring-offset-neutral-950",

        "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
        "after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent",
        "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",

        className ?? "",
      ].join(" ")}
    >
      <h2 className="text-sm font-medium text-neutral-100 text-center md:text-left">{title}</h2>

      {/* ✅ Important: flex-1 only on desktop */}
      <div className="mt-3 md:flex-1">{children}</div>
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
