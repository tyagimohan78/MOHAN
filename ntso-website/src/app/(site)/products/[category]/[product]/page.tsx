import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CheckList } from "@/components/ui/cards";
import { Icon } from "@/components/ui/icon";
import { Notice } from "@/components/ui/notice";
import { QuoteForm } from "@/components/forms/quote-form";
import { getProduct, quoteCategoryFor } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ category: string; product: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, product } = await params;
  const p = await getProduct(product);
  if (!p || p.category.slug !== category) return { title: "Product not found" };
  return pageMetadata({ title: p.name, description: p.shortDescription, path: `/products/${category}/${p.slug}` });
}

export default async function ProductPage({ params }: Props) {
  const { category, product } = await params;
  const p = await getProduct(product);
  if (!p || p.category.slug !== category || p.category.kind !== "HARDWARE") notFound();
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/60">
        <div className="container-page py-6">
          <Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: p.category.name, href: `/products/${p.category.slug}` }, { label: p.name }]} />
        </div>
      </section>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-3xl border border-navy-100 bg-gradient-to-br from-navy-50 to-navy-100">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.imageAlt || p.name} className="h-full w-full object-contain p-8" />
            ) : (
              <>
                <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
                <Icon name={p.category.icon} className="relative h-32 w-32 text-navy-400" />
                <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-500">Illustrative image</span>
              </>
            )}
          </div>
          <div>
            {p.vendor && <p className="text-sm font-semibold tracking-wide text-electric-700 uppercase">{p.vendor}</p>}
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{p.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{p.shortDescription}</p>
            <p className="mt-4 leading-7 text-slate-700">{p.description}</p>
            {p.highlights.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-base font-bold">Highlights</h2>
                <CheckList items={p.highlights} />
              </div>
            )}
            {p.useCase && (
              <p className="mt-6 rounded-xl bg-navy-50 p-4 text-sm">
                <strong className="text-navy-900">Typical use:</strong> {p.useCase}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#quote" size="lg">Request a quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href={`/products/${p.category.slug}`} size="lg" variant="outline">More in {p.category.name}</ButtonLink>
            </div>
            <Notice className="mt-8" tone="info">
              Pricing, exact specifications, warranty terms and availability are confirmed in a written quotation. {p.isSample && "This is a representative listing."}
            </Notice>
          </div>
        </div>
      </Section>
      <Section tone="muted" id="quote">
        <div className="mx-auto max-w-3xl rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
          <h2 className="text-2xl font-bold">Request a quote: {p.name}</h2>
          <p className="mt-2 mb-8 text-slate-600">
            Tell us the quantity and any configuration preferences. Need help choosing? <Link href="/contact" className="font-medium text-electric-700 underline">Contact our team</Link>.
          </p>
          <QuoteForm defaults={{ category: quoteCategoryFor(p.category.group), productName: p.name }} sourcePage={`/products/${p.category.slug}/${p.slug}`} />
        </div>
      </Section>
    </>
  );
}
