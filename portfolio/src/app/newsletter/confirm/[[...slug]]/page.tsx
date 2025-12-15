"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cinzel, inter } from "@/lib/fonts";

type ConfirmState = "idle" | "loading" | "confirmed" | "already" | "expired" | "invalid" | "error";

export default function ConfirmNewsletterPage() {
  const pathname = usePathname();
  const sp = useSearchParams();

  // Pull token from either:
  //  - /newsletter/confirm/<token>
  //  - /newsletter/confirm?token=<token>
  const token = useMemo(() => {
    const tokenFromQuery = sp.get("token")?.trim();
    const parts = (pathname ?? "").split("/").filter(Boolean);
    const last = parts[parts.length - 1];

    // If last segment is literally "confirm", there is no token in the path.
    const tokenFromPath = last && last !== "confirm" ? last.trim() : "";

    return tokenFromPath || tokenFromQuery || "";
  }, [pathname, sp]);

  const [state, setState] = useState<ConfirmState>("idle");
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
        const res = await fetch("/api/newsletter/confirm", {
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
                : "Confirmation failed.";

          if (cancelled) return;

          if (errText.toLowerCase().includes("expired")) {
            setState("expired");
            setMsg("This confirmation link expired. Subscribe again to get a new one.");
          } else if (errText.toLowerCase().includes("invalid")) {
            setState("invalid");
            setMsg("This confirmation link is invalid or already used.");
          } else {
            setState("error");
            setMsg(errText);
          }
          return;
        }

        if (cancelled) return;

        if (data.status === "already_confirmed") {
          setState("already");
          setMsg("You’re already confirmed. ✅");
        } else {
          setState("confirmed");
          setMsg("Thanks — your subscription is now active. ✅");
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
        <div className={`${inter.className} text-xs uppercase tracking-[0.35em]`} style={{ color: "#7c0902" }}>
          Newsletter
        </div>

        <h1 className={`${cinzel.className} mt-3 text-3xl font-medium md:text-4xl`}>
          {state === "loading"
            ? "Confirming…"
            : state === "confirmed"
              ? "Confirmed ✅"
              : state === "already"
                ? "Already confirmed ✅"
                : state === "expired"
                  ? "Link expired"
                  : state === "invalid"
                    ? "Invalid link"
                    : "Confirm subscription"}
        </h1>

        <p className={`${inter.className} mt-4 text-white/70`}>{msg}</p>

        {/* (Optional) tiny debug so you can verify token detection; delete later */}
        <pre className="mt-6 rounded-2xl bg-black/40 p-4 text-xs text-white/50 ring-1 ring-white/10">
          {JSON.stringify({ tokenDetected: token, pathname }, null, 2)}
        </pre>

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
