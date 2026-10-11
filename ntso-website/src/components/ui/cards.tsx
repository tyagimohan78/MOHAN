import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "./icon";

export function ServiceCard({ icon, title, text, href, cta = "Learn more" }: { icon: string; title: string; text: string; href: string; cta?: string }) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-electric-500/40 hover:shadow-lift"
    >
      <IconTile name={icon} />
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{text}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700">
        {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function FeatureCard({ icon, title, children }: { icon?: string; title: string; children: ReactNode }) {
  return (
    <div className="h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
      {icon && <IconTile name={icon} size="sm" />}
      <h3 className={`${icon ? "mt-4" : ""} text-base font-bold`}>{title}</h3>
      <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}

export function CheckList({ items, columns = 1, inverted = false }: { items: string[]; columns?: 1 | 2 | 3; inverted?: boolean }) {
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <ul className={`grid gap-3 ${cols}`}>
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-sm leading-6">
          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${inverted ? "bg-electric-500/20 text-electric-300" : "bg-electric-500/15 text-electric-700"}`}>
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <span className={inverted ? "text-navy-100" : "text-slate-700"}>{t}</span>
        </li>
      ))}
    </ul>
  );
}
