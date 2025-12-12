
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LinkIcon from "@/icons/Link.svg";

function NavItem({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "text-red-900" : "text-red-600 hover:text-zinc-900",
      ].join(" ")}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

export default function NavBar() {
  return (
    <nav className="flex items-center gap-2">
      <NavItem href="/projects" Icon={LinkIcon} label="Projects" />
    </nav>
  );
}
