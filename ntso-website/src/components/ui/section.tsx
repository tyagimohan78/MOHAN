import type { ReactNode } from "react";

export function Section({ id, children, tone = "white", className = "" }: { id?: string; children: ReactNode; tone?: "white" | "muted" | "navy"; className?: string }) {
  const bg = tone === "muted" ? "bg-navy-50/60" : tone === "navy" ? "bg-navy-950 text-navy-100" : "bg-white";
  return (
    <section id={id} className={`${bg} py-16 sm:py-20 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, intro, align = "left", inverted = false, as: H = "h2" }: { eyebrow?: string; title: string; intro?: ReactNode; align?: "left" | "center"; inverted?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={`mb-10 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className={`eyebrow ${inverted ? "text-electric-400" : ""}`}>
          <span className="h-px w-6 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <H className={`mt-3 text-3xl font-bold sm:text-4xl ${inverted ? "text-white" : ""}`}>{title}</H>
      {intro && <div className={`mt-4 text-lg leading-8 ${inverted ? "text-navy-200" : "text-slate-600"}`}>{intro}</div>}
    </div>
  );
}
