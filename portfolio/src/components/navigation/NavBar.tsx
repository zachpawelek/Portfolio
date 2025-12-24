"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const pathname = usePathname();

  const shell =
    variant === "dark"
      ? "bg-white/10 ring-1 ring-white/15 backdrop-blur-md"
      : "bg-white/60 ring-1 ring-black/10 backdrop-blur-md";

  const linkBase =
    variant === "dark"
      ? "text-white/80 hover:text-white"
      : "text-neutral-600 hover:text-neutral-900";

  const linkActive =
    variant === "dark" ? "text-white font-semibold" : "text-neutral-900 font-semibold";

  return (
    <nav aria-label="Main" className={`rounded-full ${shell}`}>
      <ul className="flex items-center gap-3 px-3 py-0.75 sm:gap-6 sm:px-4 sm:py-2">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-[13px] sm:text-sm transition-colors ${active ? linkActive : linkBase}`}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
