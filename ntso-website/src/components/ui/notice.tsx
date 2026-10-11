import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

const tones = {
  info: { cls: "border-navy-200 bg-navy-50 text-navy-800", Icon: Info },
  success: { cls: "border-emerald-200 bg-emerald-50 text-emerald-900", Icon: CircleCheck },
  warning: { cls: "border-amber-200 bg-amber-50 text-amber-900", Icon: TriangleAlert },
  error: { cls: "border-red-200 bg-red-50 text-red-900", Icon: TriangleAlert },
};

export function Notice({ tone = "info", title, children, className = "" }: { tone?: keyof typeof tones; title?: string; children?: ReactNode; className?: string }) {
  const { cls, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl border p-4 text-sm ${cls} ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-1" : ""}>{children}</div>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "cyan" | "green" | "amber" | "red" | "slate" }) {
  const t = {
    navy: "bg-navy-100 text-navy-800",
    cyan: "bg-electric-300/30 text-electric-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-700",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}
