import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { SampleNotice } from "@/components/ui/sample-notice";
import { QuoteForm } from "@/components/forms/quote-form";
import { Icon } from "@/components/ui/icon";
import { getCategory, quoteCategoryFor } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).category);
  if (!c) return { title: "Category not found" };
  return pageMetadata({ title: c.name, description: `${c.description} Request a quotation from NTSO Private Limited.`.slice(0, 160), path: `/products/${c.slug}` });
}

export default async function CategoryPage({ params }: Props) {
  const c = await getCategory((await params).category);
  if (!c) notFound();
  if (c.kind === "SOFTWARE") redirect(`/software-licensing#${c.slug}`);
  const isSoftware = false;
  const parent = { label: "Products", href: "/products" };
  return (
    <>
      <PageHero
        crumbs={[parent, { label: c.name }]}
        eyebrow={c.group}
        title={c.name}
        intro={c.description}
        actions={<ButtonLink href="#quote" size="lg">Request a quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>}
        aside={
          <div className="grid aspect-square max-w-xs place-items-center justify-self-end rounded-3xl border border-white/10 bg-white/5">
            <Icon name={c.icon} className="h-28 w-28 text-electric-400" />
          </div>
        }
      />
      <Section>
        <SampleNotice kind={isSoftware ? "license" : "product"} />
        {c.products.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} icon={c.icon} href={isSoftware ? `/software-licensing/${p.slug}` : `/products/${c.slug}/${p.slug}`} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 p-10 text-center">
            <Icon name={c.icon} className="mx-auto h-10 w-10 text-navy-400" />
            <h2 className="mt-4 text-xl font-bold">Tell us what you need in {c.name.toLowerCase()}</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">We do not list individual models for this category yet. Share the specification, model or quantity below and we will respond with options.</p>
          </div>
        )}
      </Section>
      <Section tone="muted" id="quote">
        <div className="mx-auto max-w-3xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
          <h2 className="text-2xl font-bold">Request a quote for {c.name}</h2>
          <p className="mt-2 mb-8 text-slate-600">Include quantities, preferred brands or specifications, and the delivery city.</p>
          <QuoteForm defaults={{ category: quoteCategoryFor(c.group), productName: c.name }} sourcePage={`/products/${c.slug}`} />
        </div>
      </Section>
    </>
  );
}
