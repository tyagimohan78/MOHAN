import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

export function PageHero({ eyebrow, title, intro, crumbs, actions, aside }: { eyebrow?: string; title: string; intro?: ReactNode; crumbs: Crumb[]; actions?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true" />
      <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-electric-500/20 blur-3xl" aria-hidden="true" />
      <div className="container-page relative grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-20">
        <div className="animate-fade-up">
          <Breadcrumbs items={crumbs} inverted />
          {eyebrow && <p className="eyebrow mt-6 text-electric-400">{eyebrow}</p>}
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{title}</h1>
          {intro && <div className="mt-5 max-w-2xl text-lg leading-8 text-navy-200">{intro}</div>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside && <div className="hidden lg:block">{aside}</div>}
      </div>
    </section>
  );
}
