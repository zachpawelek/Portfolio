"use client";

import { useMemo, useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success" }
  | { state: "error"; message: string };

const MAX_MESSAGE = 1000;

function isEmailLike(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Honeypot (bots fill this; humans never see it)
  const [company, setCompany] = useState("");

  const [status, setStatus] = useState<Status>({ state: "idle" });

  const remaining = useMemo(() => MAX_MESSAGE - message.length, [message.length]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!isEmailLike(email)) return false;
    if (!message.trim()) return false;
    if (message.length > MAX_MESSAGE) return false;
    return true;
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "loading" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          company, // honeypot
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "Something went wrong. Please try again.";
        setStatus({ state: "error", message: msg });
        return;
      }

      setStatus({ state: "success" });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCompany("");
    } catch {
      setStatus({
        state: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Honeypot */}
      <div className="hidden">
        <label className="text-sm">
          Company
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
            autoComplete="off"
            tabIndex={-1}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Email
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            required
          />
          {!email || isEmailLike(email) ? null : (
            <p className="mt-1 text-xs text-red-400">Please enter a valid email.</p>
          )}
        </label>
      </div>

      <label className="block">
        <span className="text-xs uppercase tracking-wide text-neutral-500">
          Subject (optional)
        </span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
          placeholder="What’s this about?"
          autoComplete="off"
        />
      </label>

      <label className="block">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            Message
          </span>
          <span className="text-xs text-neutral-500">{remaining} left</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE + 50))}
          className="mt-2 min-h-[140px] w-full resize-y rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700"
          placeholder="Write your message..."
          required
        />
        {message.length <= MAX_MESSAGE ? null : (
          <p className="mt-1 text-xs text-red-400">
            Message is too long (max {MAX_MESSAGE} characters).
          </p>
        )}
      </label>

      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={!canSubmit || status.state === "loading"}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.state === "loading" ? "Sending…" : "Send message"}
        </button>

        {status.state === "success" ? (
          <p className="text-sm text-emerald-400">Sent — thanks!</p>
        ) : status.state === "error" ? (
          <p className="text-sm text-red-400">{status.message}</p>
        ) : (
          <span />
        )}
      </div>

      <p className="text-xs text-neutral-500">
        By sending, you agree to be contacted back at the email you provided.
      </p>
    </form>
  );
}
