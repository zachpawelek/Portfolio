"use client";

import { useEffect, useState } from "react";
import { cinzel, inter } from "@/lib/fonts";

type UiStatus = "idle" | "sending" | "ok" | "error";

export default function NewsletterAdminPage() {
  const [subject, setSubject] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<UiStatus>("idle");
  const [msg, setMsg] = useState("");

  //  Active subscriber count UI
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [statsError, setStatsError] = useState("");

  // Show failure list if any
  const [failedList, setFailedList] = useState<Array<{ email: string; error: string }>>([]);

  async function loadStats() {
    setStatsError("");
    try {
      const res = await fetch("/api/newsletter/stats", { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const errText =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message
              ? String(data.error.message)
              : "Failed to load stats.";
      
        setStatsError(errText);
        setActiveCount(null);
        return;
      }
      
      setActiveCount(typeof data.activeCount === "number" ? data.activeCount : 0);
    } catch {
      setStatsError("Network error while loading stats.");
      setActiveCount(null);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    setFailedList([]);

    try {
      if (!subject.trim()) {
        setStatus("error");
        setMsg("Please enter a subject.");
        return;
      }

      if (!file) {
        setStatus("error");
        setMsg("Please choose a PDF or DOCX file to attach.");
        return;
      }

      const name = file.name.toLowerCase();
      if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
        setStatus("error");
        setMsg("Only .pdf or .docx files are allowed.");
        return;
      }

      const fd = new FormData();
      fd.set("subject", subject.trim());
      if (testEmail.trim()) fd.set("testEmail", testEmail.trim());
      fd.set("file", file);

      const res = await fetch("/api/newsletter/send-upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const errText =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message
              ? String(data.error.message)
              : "Send failed.";

        setStatus("error");
        setMsg(errText);
        return;
      }

      setStatus("ok");
      setMsg(`Sent: ${data.sent} • Failed: ${data.failedCount}`);

      if (Array.isArray(data.failed)) {
        setFailedList(
          data.failed
            .filter((x: any) => x && typeof x.email === "string")
            .map((x: any) => ({
              email: String(x.email),
              error: typeof x.error === "string" ? x.error : "Unknown error",
            }))
        );
      }

      setFile(null);

      // refresh count after send (useful if someone unsubscribed recently, etc.)
      loadStats();
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <div
          className={`${inter.className} text-xs uppercase tracking-[0.35em]`}
          style={{ color: "#7c0902" }}
        >
          Admin
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className={`${cinzel.className} text-3xl font-medium md:text-4xl`}>
            Newsletter Sender
          </h1>

          <div className="text-right">
            <div className={`${inter.className} text-xs text-white/50`}>Active subscribers</div>
            <div className={`${inter.className} mt-1 text-lg text-white/80`}>
              {activeCount === null ? "…" : activeCount}
            </div>

            <button
              type="button"
              onClick={loadStats}
              className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/20 hover:bg-white/15"
            >
              Refresh
            </button>

            {statsError ? (
              <div className={`${inter.className} mt-2 text-xs text-red-300`}>{statsError}</div>
            ) : null}
          </div>
        </div>

        <p className={`${inter.className} mt-4 text-white/70`}>
          Upload a PDF/DOCX attachment and send to either a single test recipient or all active
          subscribers.
        </p>

        <form onSubmit={onSend} className="mt-10 space-y-6">
          <label className="block">
            <span className={`${inter.className} text-sm text-white/60`}>Subject</span>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject..."
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </label>

          <label className="block">
            <span className={`${inter.className} text-sm text-white/60`}>
              Test email (optional — if filled, only sends to this address)
            </span>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@domain.com"
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </label>

          <label className="block">
            <span className={`${inter.className} text-sm text-white/60`}>
              Attachment (PDF or DOCX)
            </span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
              required
            />
            <div className={`${inter.className} mt-2 text-xs text-white/40`}>
              Max size enforced server-side (recommended ≤ 10MB).
            </div>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#7c0902" }}
            >
              {status === "sending"
                ? "Sending..."
                : testEmail.trim()
                  ? "Send test email"
                  : "Send to all active"}
            </button>

            <a
              href="/"
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
            >
              Back to site
            </a>
          </div>

          {msg ? (
            <div
              className={`${inter.className} text-sm ${
                status === "error" ? "text-red-300" : "text-white/70"
              }`}
            >
              {msg}
            </div>
          ) : null}

          {failedList.length ? (
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className={`${inter.className} text-sm text-white/80`}>Failures</div>
              <ul className={`${inter.className} mt-3 space-y-2 text-xs text-white/70`}>
                {failedList.map((f) => (
                  <li key={f.email}>
                    <span className="text-white/90">{f.email}</span>
                    <span className="text-white/40"> — {f.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>

        <div className={`${inter.className} mt-10 text-xs text-white/40`}>
          Tip: leave “Test email” blank to send to all <code>active</code> subscribers.
        </div>
      </div>
    </main>
  );
}
