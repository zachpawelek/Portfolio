import type { Metadata } from "next";
import Link from "next/link";

// Reuse the Reveal you already made for About.
// If you moved it elsewhere, adjust this import.
import Reveal from "../about/Reveal";

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of projects I’ve built — shipped features, experiments, and case studies.",
};

type ProjectLink = {
  label: string;
  href: string;
};

type Project = {
  title: string;
  summary: string;
  year?: string;
  featured?: boolean;
  status?: "Shipped" | "In progress" | "Experiment";
  tech: string[];
  highlights?: string[];
  links: ProjectLink[];
};

const projects: Project[] = [
  {
    title: "Newsletter System (Vercel + Supabase + Resend)",
    summary:
      "A production-style newsletter feature with confirmation, unsubscribe flow, admin send, and tracking.",
    year: "2025",
    featured: true,
    status: "Shipped",
    tech: ["Next.js", "TypeScript", "Supabase", "Postgres", "Resend", "Vercel"],
    highlights: [
      "Double opt-in confirmation",
      "Unsubscribe flow",
      "Admin send + stats endpoint",
    ],
    links: [
      // Add your own URLs:
      { label: "Site", href: "/" },
      // { label: "Repo", href: "https://github.com/you/your-repo" },
      // { label: "Case study", href: "/projects/newsletter" }, // add later if you want
    ],
  },
  {
    title: "Portfolio Website",
    summary:
      "A fast, minimal portfolio with parallax hero, polished UI pages, and real feature work (newsletter/contact).",
    year: "2025",
    featured: true,
    status: "In progress",
    tech: ["Next.js", "React", "Tailwind", "Vercel"],
    highlights: ["Parallax hero", "Contact form UX", "Animated section reveals"],
    links: [
      { label: "Live", href: "/" },
      // { label: "Repo", href: "https://github.com/you/portfolio" },
    ],
  },

  // Add more projects by copying one of these blocks.
  // Tip: keep summaries short and link out to GitHub for deeper details.
];

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <main className="relative">
      {/* Subtle background glow (same vibe as About/Contact) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[60rem] -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div className="absolute top-72 left-10 h-60 w-60 rounded-full bg-neutral-200/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-neutral-200/5 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 md:px-6">
        <Reveal>
          <header className="mb-10">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Projects
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-100 md:text-4xl">
              Things I’ve built
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
              A mix of shipped features, experiments, and portfolio work. Some projects have
              live demos, some are repo-only, and some will eventually have in-depth case studies.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full border border-neutral-800 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Contact →
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                About →
              </Link>
            </div>
          </header>
        </Reveal>

        {/* Featured */}
        {featured.length > 0 ? (
          <section className="mb-10">
            <Reveal delay={40}>
              <h2 className="text-sm font-medium text-neutral-100">Featured</h2>
              <p className="mt-1 text-xs text-neutral-500">
                The projects I’d point someone to first.
              </p>
            </Reveal>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {featured.map((project, idx) => (
                <Reveal key={project.title} delay={80 + idx * 60}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {/* More */}
        <section>
          <Reveal delay={40}>
            <h2 className="text-sm font-medium text-neutral-100">More</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Smaller builds, older work, and experiments.
            </p>
          </Reveal>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {more.length > 0 ? (
              more.map((project, idx) => (
                <Reveal key={project.title} delay={80 + idx * 60}>
                  <ProjectCard project={project} />
                </Reveal>
              ))
            ) : (
              <Reveal delay={80}>
                <EmptyState />
              </Reveal>
            )}
          </div>
        </section>

        <Reveal delay={120}>
          <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
            <h3 className="text-sm font-medium text-neutral-100">
              Want a deeper write-up?
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Next upgrade: add case study pages per project (problem → approach → screenshots → tradeoffs).
              I can help you set up MDX-based case studies when you’re ready.
            </p>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Ask me about a project →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={[
        "group relative overflow-hidden",
        "rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-950/55",
        "focus-within:-translate-y-0.5 focus-within:border-neutral-700 focus-within:bg-neutral-950/55",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-offset-2 focus-within:ring-offset-neutral-950",
        // subtle “shine” sweep on hover
        "after:pointer-events-none after:absolute after:inset-0 after:opacity-0 after:transition-all after:duration-700",
        "after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
        "after:translate-x-[-120%] hover:after:opacity-100 hover:after:translate-x-[120%]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-neutral-100">{project.title}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {project.status ? <Badge>{project.status}</Badge> : null}
            {project.year ? <span>• {project.year}</span> : null}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-neutral-300">{project.summary}</p>

      {project.highlights?.length ? (
        <ul className="mt-4 space-y-1 text-sm text-neutral-400">
          {project.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-neutral-600" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.slice(0, 8).map((t) => (
          <Pill key={t}>{t}</Pill>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
    >
      <span>{label}</span>
      <span aria-hidden className="text-neutral-500">
        →
      </span>
    </Link>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-900/50 px-2 py-0.5 text-xs text-neutral-300">
      {children}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-neutral-700 hover:bg-neutral-900/60",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
      <h3 className="text-sm font-medium text-neutral-100">No projects yet</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Add projects to the <code className="text-neutral-300">projects</code> array in{" "}
        <code className="text-neutral-300">src/app/projects/page.tsx</code>.
      </p>
      <p className="mt-2 text-xs text-neutral-500">
        You can link to GitHub repos now and add in-site case studies later.
      </p>
    </div>
  );
}
