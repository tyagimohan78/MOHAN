import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/ui/cta-band";
import { Icon } from "@/components/ui/icon";
import { SampleNotice } from "@/components/ui/sample-notice";
import { anchor, getHardwareCategories, groupBy } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "IT Hardware — Laptops, Servers, Networking, Printers & CCTV",
  description: "Business laptop and desktop procurement, servers and storage, networking equipment, printers, UPS, CCTV and firewall appliances for businesses in India. Request a quotation.",
  path: "/products",
});

export default async function ProductsPage() {
  const categories = await getHardwareCategories();
  const groups = groupBy(categories, (c) => c.group);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Products" }]}
        eyebrow="IT hardware"
        title="IT hardware for offices, server rooms and sites"
        intro="Business-grade devices and infrastructure sourced to your specification — from a single laptop to a full office fit-out. Request a quotation for any category."
        actions={<ButtonLink href="/request-quote?category=IT%20Hardware%20%26%20Devices" size="lg">Request a hardware quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>}
      />
      <Section>
        <nav aria-label="Product groups" className="mb-10 flex flex-wrap gap-2">
          {groups.map(([g]) => (
            <a key={g} href={`#${anchor(g)}`} className="rounded-full border border-navy-200 px-4 py-1.5 text-sm font-medium text-navy-800 hover:border-electric-500 hover:bg-electric-500/10">
              {g}
            </a>
          ))}
        </nav>
        <SampleNotice />
        <div className="mt-12 space-y-16">
          {groups.map(([group, cats]) => (
            <section key={group} id={anchor(group)} aria-labelledby={`h-${anchor(group)}`}>
              <h2 id={`h-${anchor(group)}`} className="text-2xl font-bold">{group}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cats.map((c) => (
                  <li key={c.id}>
                    <Link href={`/products/${c.slug}`} className="group flex h-full gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-electric-500/40 hover:shadow-lift">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric-500/10 text-electric-700 group-hover:bg-electric-500 group-hover:text-navy-950">
                        <Icon name={c.icon} className="h-5.5 w-5.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display font-bold text-navy-900">{c.name}</span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">{c.description}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-electric-700">
                          {c._count.products > 0 ? `${c._count.products} example listing${c._count.products > 1 ? "s" : ""}` : "Request a quote"} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>
      <CtaBand title="Can't find what you need?" text="We source a wide range of business IT equipment. Send us a model number, specification or a description of your requirement." />
    </>
  );
}
