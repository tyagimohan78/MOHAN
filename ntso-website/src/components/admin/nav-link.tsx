"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AdminNavLink({ href, exact, children }: { href: string; exact?: boolean; children: ReactNode }) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(href + "/");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${active ? "bg-electric-500/15 font-semibold text-white" : "text-navy-300 hover:bg-white/5 hover:text-white"}`}
    >
      {children}
    </Link>
  );
}
