"use client";

import { useEffect, useState } from "react";

type Props = {
  variant?: "dark" | "light";
  className?: string;
};

// ✅ In-memory flag: persists during SPA nav, resets on full reload.
let dismissedThisLoad = false;

export default function ResponsiveNotice({ variant = "dark", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!dismissedThisLoad) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    // next tick so transition animates
    const t = window.setTimeout(() => setEntered(true), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  const dismiss = () => {
    dismissedThisLoad = true;
    setOpen(false);
  };

  if (!open) return null;

  const shell =
    variant === "dark"
      ? "border-white/10 bg-white/5 text-white"
      : "border-black/10 bg-white/60 text-neutral-900";

  const subText = variant === "dark" ? "text-white/60" : "text-neutral-600";
  const mainText = variant === "dark" ? "text-white/85" : "text-neutral-900";

  const btn =
    variant === "dark"
      ? "border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 focus-visible:ring-white/25"
      : "border-black/10 bg-black/5 text-neutral-700 hover:text-neutral-900 hover:bg-black/10 focus-visible:ring-black/20";

  return (
    <div
      className={[
        "pointer-events-auto",
        "rounded-2xl border backdrop-blur-md",
        "px-3 py-2",
        "shadow-[0_18px_60px_-35px_rgba(0,0,0,0.55)]",
        // ✅ subtle: slightly transparent by default
        "opacity-70 hover:opacity-100 transition-opacity duration-300",
        // ✅ slide/fade in from right
       // ✅ slower + smoother entrance (does NOT affect your scroll fade-out)
"transition-[transform,opacity] duration-1400 ease-[cubic-bezier(0.16,1,0.3,1)]",
entered ? "translate-x-0" : "translate-x-10",
entered ? "opacity-70" : "opacity-0",

        shell,
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className={`text-xs ${mainText}`}>Built to work beautifully on any screen.</p>
          <p className={`text-[11px] ${subText}`}>Looks great on mobile too.</p>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className={[
            "ml-auto shrink-0",
            "rounded-full border",
            "h-7 w-7",
            "inline-flex items-center justify-center",
            "transition-[transform,background-color,color,opacity] duration-200",
            "focus:outline-none focus-visible:ring-2",
            btn,
          ].join(" ")}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
