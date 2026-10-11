import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RefreshCw } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CheckList } from "@/components/ui/cards";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/notice";
import { QuoteForm } from "@/components/forms/quote-form";
import { getProduct, quoteCategoryFor } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p || p.category.kind !== "SOFTWARE") return { title: "License not found" };
  return pageMetadata({ title: `${p.name} Licensing`, description: p.shortDescription, path: `/software-licensing/${p.slug}` });
}

export default async function LicensePage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p || p.category.kind !== "SOFTWARE") notFound();
  const rows: [string, string | null][] = [
    ["Vendor", p.vendor],
    ["Category", p.category.name],
    ["License type", p.licenseType],
    ["Subscription term", p.subscriptionTerm],
    ["Number of users / devices", p.licensedPer],
    ["Business use case", p.useCase],
  ];
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/60">
        <div className="container-page py-6">
          <Breadcrumbs items={[{ label: "Software & Licensing", href: "/software-licensing" }, { label: p.category.name, href: `/software-licensing#${p.category.slug}` }, { label: p.name }]} />
        </div>
      </section>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy-900 text-electric-400">
              <Icon name={p.category.icon} className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">{p.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{p.shortDescription}</p>
            <p className="mt-4 leading-7">{p.description}</p>
            {p.highlights.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-lg font-bold">Key capabilities</h2>
                <CheckList items={p.highlights} />
              </div>
            )}
          </div>
          <aside className="h-fit rounded-2xl border border-navy-100 bg-white p-6 shadow-card lg:sticky lg:top-32">
            <h2 className="text-lg font-bold">License details</h2>
            <dl className="mt-4 divide-y divide-navy-100 text-sm">
              {rows.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="py-2.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="mt-0.5 font-medium text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 grid gap-2">
              <ButtonLink href="#quote">Request a Quote</ButtonLink>
              <ButtonLink href={`/license-renewal?product=${encodeURIComponent(p.name)}`} variant="outline">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> License Renewal Enquiry
              </ButtonLink>
            </div>
            <Notice className="mt-6">Names, editions and eligibility are confirmed with you at quotation.</Notice>
          </aside>
        </div>
      </Section>
      <Section tone="muted" id="quote">
        <div className="mx-auto max-w-3xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
          <h2 className="text-2xl font-bold">Request a quote: {p.name}</h2>
          <p className="mt-2 mb-8 text-slate-600">Include the number of users or devices and your preferred term.</p>
          <QuoteForm defaults={{ category: quoteCategoryFor(p.category.group), productName: p.name }} sourcePage={`/software-licensing/${p.slug}`} />
        </div>
      </Section>
    </>
  );
}
