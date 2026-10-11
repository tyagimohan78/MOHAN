import type { ReactNode } from "react";
import { PageHero } from "./page-hero";
import { Section } from "./section";
import { Notice } from "./notice";

export function LegalPage({ title, intro, updated, children }: { title: string; intro?: string; updated: string; children: ReactNode }) {
  return (
    <>
      <PageHero crumbs={[{ label: title }]} eyebrow="Policies" title={title} intro={intro} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <Notice tone="warning" title="Draft for review">
            This policy is a draft template. It must be reviewed and customised by NTSO Private Limited and its legal advisers before the website is launched.
          </Notice>
          <p className="mt-6 text-sm text-slate-500">Last updated: {updated}</p>
          <div className="prose-ntso mt-4">{children}</div>
        </div>
      </Section>
    </>
  );
}
