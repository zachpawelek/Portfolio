"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/navigation/NavBar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/60 backdrop-blur-md ring-1 ring-black/5" : "bg-transparent",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex max-w-6xl items-center justify-between px-6 py-4 transition-colors duration-300",
          scrolled ? "text-neutral-900" : "text-white",
        ].join(" ")}
      >
        <Link href="/" className="font-semibold tracking-wide">
          ZP
        </Link>

        <NavBar variant={scrolled ? "light" : "dark"} />
      </div>
    </header>
  );
}
