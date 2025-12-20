import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "./ContactForm";
import CopyButton from "./CopyButton";
import Reveal from "../about/Reveal";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — project inquiries, collaboration, or just say hi.",
};

function env(name: string, fallback = "") {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : fallback;
}

export default function ContactPage() {
  const email = env("NEXT_PUBLIC_CONTACT_EMAIL", "your@email.com");
  const location = env("NEXT_PUBLIC_LOCATION", "Chicago, IL");
  const githubUrl = env("NEXT_PUBLIC_GITHUB_URL", "https://github.com/zachpawelek");
  const linkedinUrl = env(
    "NEXT_PUBLIC_LINKEDIN_URL",
    "https://www.linkedin.com/in/zach-pawelek-60a2033a1/"
  );
  const instagramUrl = env("NEXT_PUBLIC_INSTAGRAM_URL", "https://www.instagram.com/notzachh/");

  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-240 -translate-x-1/2 rounded-full bg-neutral-200/10 blur-3xl" />
        <div
          className="absolute top-56 right-10 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(124, 9, 2, 0.10)" }}
        />
      </div>

      {/* Cinematic hero header */}
      <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/rivers.jpg"
            alt="River landscape"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(124,9,2,0.22),transparent_35%),linear-gradient(to_bottom,rgba(124,9,2,0.10),transparent_45%)]" />

        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <Reveal>
            <header className="max-w-2xl">
              <p className="text-xs uppercase tracking-wide text-white/75">Contact</p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Let’s talk
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75">
                Want to work together, have a question, or just want to say hi? Send a message here
                and I’ll get back to you.
              </p>
            </header>
          </Reveal>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-neutral-950" />
      </section>

      {/* Page content */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4">
            <Reveal delay={0}>
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
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Location</p>
                <p className="mt-1 text-sm text-neutral-200">{location}</p>
                <p className="mt-2 text-xs text-neutral-500">Open to remote + hybrid.</p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Connect</p>
                <p className="mt-1 text-sm text-neutral-300">
                  Prefer socials? These are the fastest ways to reach me.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {linkedinUrl ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 transition
                                 hover:border-neutral-700 hover:bg-neutral-900/45 hover:shadow-[0_0_44px_rgba(124,9,2,0.18)]
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      aria-label="LinkedIn"
                      title="LinkedIn"
                    >
                      <span
                        className="grid h-12 w-12 place-items-center rounded-xl border border-neutral-800 bg-neutral-950/30 text-neutral-100 transition
                                   group-hover:border-neutral-700 group-hover:bg-neutral-950/50"
                      >
                        <FaLinkedin size={26} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-100">LinkedIn</span>
                        <span className="block text-xs text-neutral-500">Message or connect</span>
                      </span>

                      <span className="ml-auto text-neutral-400 transition group-hover:text-neutral-200">
                        ↗
                      </span>
                    </a>
                  ) : null}

                  {githubUrl ? (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 transition
                                 hover:border-neutral-700 hover:bg-neutral-900/45 hover:shadow-[0_0_44px_rgba(124,9,2,0.18)]
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      aria-label="GitHub"
                      title="GitHub"
                    >
                      <span
                        className="grid h-12 w-12 place-items-center rounded-xl border border-neutral-800 bg-neutral-950/30 text-neutral-100 transition
                                   group-hover:border-neutral-700 group-hover:bg-neutral-950/50"
                      >
                        <FaGithub size={26} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-100">GitHub</span>
                        <span className="block text-xs text-neutral-500">See projects & code</span>
                      </span>

                      <span className="ml-auto text-neutral-400 transition group-hover:text-neutral-200">
                        ↗
                      </span>
                    </a>
                  ) : null}

                  {instagramUrl ? (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 transition
                                 hover:border-neutral-700 hover:bg-neutral-900/45 hover:shadow-[0_0_44px_rgba(124,9,2,0.18)]
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      aria-label="Instagram"
                      title="Instagram"
                    >
                      <span
                        className="grid h-12 w-12 place-items-center rounded-xl border border-neutral-800 bg-neutral-950/30 text-neutral-100 transition
                                   group-hover:border-neutral-700 group-hover:bg-neutral-950/50"
                      >
                        <FaInstagram size={26} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-100">Instagram</span>
                        <span className="block text-xs text-neutral-500">Say hi</span>
                      </span>

                      <span className="ml-auto text-neutral-400 transition group-hover:text-neutral-200">
                        ↗
                      </span>
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    Home →
                  </Link>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                  Tip: add your resume link here if you have one.
                </p>
              </div>
            </Reveal>
          </section>

          <Reveal delay={40} className="h-fit">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-950/55 hover:shadow-[0_0_44px_rgba(124,9,2,0.10)]">
              <h2 className="text-lg font-medium text-neutral-100">Send a message</h2>
              <p className="mt-1 text-xs text-neutral-500">
                This form sends via Resend through a Next.js API route.
              </p>

              <div className="mt-6">
                <ContactForm />
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
