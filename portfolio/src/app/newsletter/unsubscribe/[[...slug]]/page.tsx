"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cinzel, inter } from "@/lib/fonts";

type State =
  | "idle"
  | "loading"
  | "unsubscribed"
  | "already"
  | "expired"
  | "invalid"
  | "error";

export default function UnsubscribePage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  // Support both:
  // - /newsletter/unsubscribe/<token>
  // - /newsletter/unsubscribe?token=<token>
  const token = useMemo(() => {
    const tokenFromQuery = sp.get("token")?.trim() ?? "";
    const parts = (pathname ?? "").split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    const tokenFromPath = last && last !== "unsubscribe" ? last.trim() : "";
    return tokenFromPath || tokenFromQuery;
  }, [pathname, sp]);

  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMsg("Missing token. Try opening the link from your email again.");
      return;
    }

    let cancelled = false;

    (async () => {
      setState("loading");
      setMsg("");

      try {
        const res = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          const errText =
            typeof data?.error === "string"
              ? data.error
              : data?.error?.message
                ? String(data.error.message)
                : "Request failed.";

          if (cancelled) return;

          const lower = errText.toLowerCase();
          if (lower.includes("expired")) {
            setState("expired");
            setMsg("This link expired.");
          } else if (lower.includes("invalid")) {
            setState("invalid");
            setMsg("This link is invalid.");
          } else {
            setState("error");
            setMsg(errText);
          }
          return;
        }

        if (cancelled) return;

        // ✅ New statuses from the API:
        // - canceled: pending request canceled
        // - unsubscribed: active subscriber unsubscribed
        // - already_done: token already used
        if (data.status === "canceled") {
          setState("unsubscribed");
          setMsg("Your subscription request was canceled. ✅");
        } else if (data.status === "unsubscribed") {
          setState("unsubscribed");
          setMsg("You’ve been unsubscribed. ✅");
        } else {
          setState("already");
          setMsg("This link was already used. You’re all set. ✅");
        }
      } catch {
        if (cancelled) return;
        setState("error");
        setMsg("Network error. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="min-h-dvh bg-[rgb(10,10,10)] px-8 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <div
          className={`${inter.className} text-xs uppercase tracking-[0.35em]`}
          style={{ color: "#7c0902" }}
        >
          Newsletter
        </div>

        <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
          {state === "loading"
            ? "Processing…"
            : state === "unsubscribed"
              ? "Done ✅"
              : state === "already"
                ? "Already done ✅"
                : state === "expired"
                  ? "Link expired"
                  : state === "invalid"
                    ? "Invalid link"
                    : "Request"}
        </h1>

        <p className={`${inter.className} mt-4 text-white/70`}>{msg}</p>

        <a
          href="/"
          className="mt-8 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-black hover:opacity-90"
          style={{ backgroundColor: "#7c0902" }}
        >
          Back to site
        </a>
      </div>
    </main>
  );
}
