"use client";

import { useEffect } from "react";

export default function ScrollPerfClass() {
  useEffect(() => {
    let t: number | undefined;

    const onScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, []);

  return null;
}
