import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "./Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "A bit about me, what I do, and what I like building.",
};

function env(name: string, fallback = "") {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

export default function AboutPage() {
  // Optional “public” env vars for display (safe to expose)
  const displayName = env("NEXT_PUBLIC_NAME", "Zach");
  const location = env("NEXT_PUBLIC_LOCATION", "Chicago, IL");
  const role = env("NEXT_PUBLIC_ROLE", "Full-stack developer");
  const githubUrl = env("NEXT_PUBLIC_GITHUB_URL", "");
  const linkedinUrl = env("NEXT_PUBLIC_LINKEDIN_URL", "");

  return (
    <main className="relative">
      {/* Subtle background glow (same vibe as Contact cards) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div className="absolute top-64 left-10 h-60 w-60 rounded-full bg-neutral-200/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-neutral-200/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 md:px-6">
        {/* Header */}
        <Reveal>
          <header className="mb-10">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              About
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-100 md:text-4xl">
              Hey, I’m {displayName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
              I’m a {role} based in {location}. I like building polished UIs,
              thoughtful product experiences, and reliable APIs that hold up in
              production.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full border border-neutral-800 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
              >
                Contact →
              </Link>

              <Link
                href="/projects"
                className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
              >
                Projects →
              </Link>

              {githubUrl ? (
                <Link
                  href={githubUrl}
                  target="_blank"
                  className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  GitHub →
                </Link>
              ) : null}

              {linkedinUrl ? (
                <Link
                  href={linkedinUrl}
                  target="_blank"
                  className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  LinkedIn →
                </Link>
              ) : null}
            </div>
          </header>
        </Reveal>

        {/* Content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left column */}
          <section className="space-y-4">
            <Reveal delay={0}>
              <Card title="What I care about">
                <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-neutral-300">
                  <li>
                    <span className="text-neutral-200">Craft:</span> responsive,
                    accessible UI that feels intentional.
                  </li>
                  <li>
                    <span className="text-neutral-200">Reliability:</span> clean
                    data flows, sensible validation, predictable behavior.
                  </li>
                  <li>
                    <span className="text-neutral-200">Performance:</span> fast
                    pages, smart loading, and avoiding “unnecessary work.”
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
                  (Swap these to match your real stack — this is meant to be
                  honest and specific.)
                </p>
              </Card>
            </Reveal>

            <Reveal delay={160}>
              <Card title="Now">
                <div className="space-y-3">
                  <TimelineItem
                    title="Building portfolio features"
                    body="Polishing pages, adding real-world backend pieces, and shipping quickly."
                  />
                  <TimelineItem
                    title="Improving UX details"
                    body="Loading states, form feedback, accessibility, and responsive layouts."
                  />
                  <TimelineItem
                    title="Staying curious"
                    body="Trying new tools and patterns, but keeping the basics strong."
                  />
                </div>
              </Card>
            </Reveal>
          </section>

          {/* Right column */}
          <section className="space-y-4">
            <Reveal delay={40}>
              <Card title="A little more detail">
                <p className="text-sm leading-6 text-neutral-300">
                  I enjoy projects where product and engineering overlap —
                  places where the UI needs to feel great, and the backend needs
                  to be dependable. I’m especially interested in building
                  features end-to-end: schema → API → UI → deployment.
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Outside of coding, I like to recharge with whatever keeps me
                  grounded and curious — learning, reading, and exploring new
                  ideas.
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
                    className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                  >
                    Let’s talk →
                  </Link>
                </div>
              </Card>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
      <h2 className="text-sm font-medium text-neutral-100">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-200">{value}</p>
    </div>
  );
}

function TimelineItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative pl-5">
      <div className="absolute left-0 top-2 h-2 w-2 rounded-full bg-neutral-500" />
      <p className="text-sm text-neutral-200">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{body}</p>
    </div>
  );
}
