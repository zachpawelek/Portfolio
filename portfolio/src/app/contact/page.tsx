import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import CopyButton from "./CopyButton";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — project inquiries, collaboration, or just say hi.",
};

const ACCENT = "#7c0902";

function env(name: string, fallback = "") {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

export default function ContactPage() {
  const email = env("NEXT_PUBLIC_CONTACT_EMAIL", "your@email.com");
  const location = env("NEXT_PUBLIC_LOCATION", "Chicago, IL");
  const githubUrl = env("NEXT_PUBLIC_GITHUB_URL", "");
  const linkedinUrl = env("NEXT_PUBLIC_LINKEDIN_URL", "");

  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div
          className="absolute top-56 right-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(124, 9, 2, 0.10)" }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-wide" style={{ color: ACCENT }}>
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Let’s talk
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            Want to work together, have a question, or just want to say hi? Send a message here and
            I’ll get back to you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Email</p>
                  <p className="mt-1 text-sm text-neutral-200">{email}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Best for: project inquiries, freelance, collabs
                  </p>
                </div>
                <CopyButton text={email} />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Location</p>
              <p className="mt-1 text-sm text-neutral-200">{location}</p>
              <p className="mt-2 text-xs text-neutral-500">Open to remote + hybrid.</p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Links</p>
              <div className="mt-3 flex flex-wrap gap-3">
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

                <Link
                  href="/"
                  className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                >
                  Home →
                </Link>
              </div>

              <p className="mt-3 text-xs text-neutral-500">Tip: add your resume link here if you have one.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
            <h2 className="text-lg font-medium text-neutral-100">Send a message</h2>
            <p className="mt-1 text-xs text-neutral-500">This form sends via Resend through a Next.js API route.</p>

            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
