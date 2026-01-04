import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "../about/Reveal";
import SocialLinks from "@/components/footer/SocialLinks";
import LifeCarousel from "../about/LifeCarousel";
import ScrollHintArrow from "@/components/ui/ScrollHintArrow";



export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of projects I’ve built — shipped features, experiments, and case studies.",
};

const ACCENT = "#7c0902";

type ProjectLink = { label: string; href: string };
type ProjectPhoto = { src: string; alt?: string };

type Project = {
  title: string;
  summary: string;
  year?: string;
  featured?: boolean;
  status?: "Completed" | "In progress" | "Experiment";
  tech: string[];
  highlights?: string[];
  links: ProjectLink[];
  images?: ProjectPhoto[];
};

const projects: Project[] = [
  {
    title: "Personal Website Newsletter System (Right here on this site!)",
    summary:
      "A Fully Integrated Newsletter System With Email Confirmation, Unsubscribe flow, Admin send, and Database Tracking. Why not give it a try on the 'Home' Page?",
    year: "2025",
    featured: true,
    status: "Completed",
    tech: ["Next.js", "TypeScript", "Supabase", "Postgres", "Resend", "Vercel"],
    highlights: [
      "Double opt-in Email Confirmation",
      "Unsubscribe flow",
      "Admin-Only Sending Template",
      "API called Stats endpoint",
    ],
    links: [{ label: "Site", href: "/" }],
    images: [
      { src: "/images/projects/news1.png", alt: "Newsletter Template on the Admin Page" },
      { src: "/images/projects/news2.png", alt: "Subscription form on the Home Page" },
      { src: "/images/projects/news3.png", alt: "Sample Email for receiving newsletter information." },
    ],
  },
  {
    title: "AI Tutor - Capstone Project - Arizona State University",
    summary:
      "A web application assisting students with Algebra 1 material, allowing for custom problem upload, explained step-by-step with personalized feedback",
    year: "Fall 2025 - Spring 2026",
    featured: true,
    status: "In progress",
    tech: ["Expo", "React Native", "Tailwind", "BetterAuth", "SQLite 3"],
    highlights: [
      "OpenAI API Integration",
      "Persistent Cloud Storage",
      "Custom Problem text/image Processing",
    ],
    links: [{ label: "Live", href: "/" }],
    images: [
      { src: "/images/projects/cap1.png", alt: "Student Dashboard" },
      { src: "/images/projects/cap4.png", alt: "Chat GPT API assisted Equation Extractor" },
      { src: "/images/projects/cap3.png", alt: "Category Filters" },
    ],
  },
];

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div className="absolute top-72 left-10 h-60 w-60 rounded-full bg-neutral-200/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-neutral-200/5 blur-3xl" />
        <div
          className="absolute top-36 left-1/2 h-72 w-160 -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(124, 9, 2, 0.08)" }}
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden h-svh md:min-h-[70vh] flex items-center">

        <div className="absolute inset-0">
          <Image
            src="/images/birdy.jpg"
            alt="Projects header background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[55%_48%]"
          />

          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(124,9,2,0.22),transparent_55%),linear-gradient(to_bottom,rgba(124,9,2,0.10),transparent_45%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <Reveal>
            {/* Mobile-only centering; desktop unchanged */}
            <header className="max-w-2xl mx-auto text-center md:mx-0 md:text-left">
              <p className="text-xs uppercase tracking-wide text-white/75">Projects</p>

              {/*  Smaller only on mobile; desktop unchanged (md:text-5xl stays) */}
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                My Work + Contributions
              </h1>

              <p className="mt-4 max-w-2xl text-xs leading-5 text-white/75 md:text-sm md:leading-6">
                A mix of completed projects, University-sanctioned projects, and portfolio work — with links to live
                demos, repos, and (eventually) an abundance of more projects.
              </p>

              {/* Mobile-only centering; desktop unchanged */}
              <div className="mt-12 md:mt-7 flex flex-wrap gap-3 justify-center md:justify-start">

                <Link
                  href="/contact"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur
                             hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Contact →
                </Link>

                <Link
                  href="/about"
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur
                             hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  About →
                </Link>
              </div>
            </header>
          </Reveal>
        </div>
        {/* Mobile-only scroll hint (no text) */}
        <ScrollHintArrow />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-b from-transparent to-neutral-950" />
      </section>

      {/* Page content */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6">
        {featured.length > 0 ? (
          // Mobile-only spacing tweak; desktop unchanged
          <section className="mb-8 md:mb-10">
            <Reveal delay={40}>
              <h2 className="text-sm font-medium text-neutral-100">Featured</h2>
              <p className="mt-1 text-xs text-neutral-500">A Great Place To Start.</p>
            </Reveal>

            {/* Mobile-only tighter gap; desktop unchanged */}
            <div className="mt-4 grid items-stretch gap-3 md:gap-4 md:grid-cols-2">
              {featured.map((project, idx) => (
                <Reveal key={project.title} delay={80 + idx * 60} className="min-w-0">
                  <ProjectCard project={project} accent={ACCENT} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {/*  Mobile-only spacing tweak; desktop unchanged */}
        <section className="mt-10 md:mt-14">
          <div className="mx-auto max-w-4xl">
            <Reveal delay={40}>
              <div className="text-center">
                <h2 className="text-sm font-medium text-neutral-100">More</h2>
                <p className="mt-1 text-xs text-neutral-500">Smaller prototypes and works in progress... </p>
              </div>
            </Reveal>

            {/* Mobile-only tighter gap; desktop unchanged */}
            <div className="mt-4 grid gap-3 md:gap-4 md:grid-cols-2">
              {more.length > 0 ? (
                more.map((project, idx) => (
                  <Reveal key={project.title} delay={80 + idx * 60} className="min-w-0">
                    <ProjectCard project={project} accent={ACCENT} />
                  </Reveal>
                ))
              ) : (
                <div className="md:col-span-2 w-full flex justify-center">
                  <Reveal delay={80}>
                    <div className="mx-auto w-full max-w-md">
                      <EmptyState />
                    </div>
                  </Reveal>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-16 text-center text-xs tracking-[0.35em] text-white/35">FOLLOW ME</div>
        <SocialLinks />
      </div>
    </main>
  );
}

function ProjectCard({ project, accent }: { project: Project; accent: string }) {
  return (
    <article
      className={[
        "group relative overflow-hidden",
        //  Mobile-only radius/padding tweak; desktop unchanged (md+ returns to rounded-2xl; sm+ returns to p-5)
        "rounded-xl md:rounded-2xl border border-neutral-800 bg-neutral-950/40",
        "p-2.5 sm:p-5",
        "h-full flex flex-col",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/55",
        "hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
        "focus-within:-translate-y-0.5 focus-within:border-neutral-700 focus-within:bg-neutral-950/55",
        "focus-within:shadow-[0_0_44px_rgba(124,9,2,0.10)]",
        "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
        "after:bg-linear-to-r after:from-transparent after:via-white/5 after:to-transparent",
        "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
  <div className="min-w-0 w-full text-center sm:text-left">
    <h3
      className="text-sm sm:text-base font-medium text-neutral-100"
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {project.title}
    </h3>

    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500 justify-center sm:justify-start">
      {project.status ? <Badge accent={accent}>{project.status}</Badge> : null}
      {project.year ? <span>• {project.year}</span> : null}
    </div>
  </div>
</div>


      {/*  Mobile-compact carousel block (desktop unchanged via sm: overrides) */}
      <div className="mt-2 sm:mt-5 py-1 sm:py-8 min-h-20 sm:min-h-80">
        <LifeCarousel images={project.images ?? []} accent={accent} edgeFade={false} density="compact" />
      </div>

      <p
  className="mt-3 sm:mt-4 text-[13px] sm:text-sm leading-5 sm:leading-6 text-neutral-300
             text-center sm:text-left
             min-h-0 sm:min-h-18
             [display:-webkit-box] [-webkit-box-orient:vertical] overflow-hidden
             [-webkit-line-clamp:3] sm:[-webkit-line-clamp:3]"
>
  {project.summary}
</p>




      <div className="mt-3 sm:mt-4 min-h-0 sm:min-h-19.5">
        {project.highlights?.length ? (
          <>
            <ul className="space-y-1 text-[13px] text-neutral-400 sm:hidden">
              {project.highlights.slice(0, 2).map((h) => (
                <li key={h} className="flex gap-2">
                  <span
                    className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {h}
                  </span>
                </li>
              ))}
            </ul>

            <ul className="hidden sm:block space-y-1 text-sm text-neutral-400">
              {project.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex gap-2">
                  <span
                    className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: accent }}
                  />
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
        {project.tech.slice(0, 4).map((t) => (
          <Pill key={t}>{t}</Pill>
        ))}
        <span className="hidden sm:contents">
          {project.tech.slice(4, 8).map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </span>
      </div>

      <div className="mt-auto pt-4 sm:pt-5 flex flex-wrap gap-2">
        {project.links.map((l) => (
          <LinkButton key={l.href + l.label} href={l.href} label={l.label} />
        ))}
      </div>
    </article>
  );
}

function LinkButton({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40
                 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-neutral-200
                 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
    >
      <span>{label}</span>
      <span aria-hidden className="text-neutral-500">
        →
      </span>
    </Link>
  );
}

function Badge({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-xs"
      style={{
        borderColor: "rgba(124, 9, 2, 0.35)",
        backgroundColor: "rgba(124, 9, 2, 0.12)",
        color: accent,
      }}
    >
      {children}
    </span>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/40
                 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs text-neutral-200
                 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-neutral-900/60
                 hover:shadow-[0_0_24px_rgba(124,9,2,0.10)]"
    >
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
      <h3 className="text-sm sm:text-base font-medium text-neutral-100">No projects yet... Subscribe to Stay Up To Date</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
 
      </p>
      <p className="mt-2 text-xs text-neutral-500">Links and Additional Information to Follow.</p>
    </div>
  );
}
