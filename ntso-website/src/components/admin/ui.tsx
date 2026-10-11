import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice } from "@/components/ui/notice";

export function AdminHeader({ title, description, actions, back }: { title: string; description?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-navy-900">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", title, actions }: { children: ReactNode; className?: string; title?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  if (sp.error) return <Notice tone="error" className="mb-5">{sp.error}</Notice>;
  if (sp.saved) return <Notice tone="success" className="mb-5">Changes saved.</Notice>;
  if (sp.deleted) return <Notice tone="success" className="mb-5">Item deleted.</Notice>;
  if (sp.denied) return <Notice tone="warning" className="mb-5">You do not have permission to access that section.</Notice>;
  return null;
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-12 text-center text-sm text-slate-500">No records found.</p>}
    </div>
  );
}

export function Pager({ page, pages, params }: { page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => `?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => v)), page: String(p) } as Record<string, string>).toString()}`;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <span className="text-slate-500">Page {page} of {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50" href={href(page - 1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous</Link>}
        {page < pages && <Link className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50" href={href(page + 1)}>Next <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </div>
    </nav>
  );
}

export function Stat({ label, value, href, tone = "navy" }: { label: string; value: number | string; href?: string; tone?: "navy" | "cyan" | "amber" | "red" }) {
  const color = { navy: "text-navy-900", cyan: "text-electric-700", amber: "text-amber-600", red: "text-red-600" }[tone];
  const inner = (
    <>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-electric-500/50">{inner}</Link>
  ) : (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{inner}</div>
  );
}

export const pageParam = (v?: string) => Math.max(1, Math.min(10000, Number.parseInt(v || "1", 10) || 1));
