import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CheckList } from "@/components/ui/cards";
import { IconTile } from "@/components/ui/icon";
import { CtaBand } from "@/components/ui/cta-band";
import { industries } from "@/content/marketing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Industries We Serve",
  description: "IT solutions for manufacturing, corporate offices, healthcare, education, retail, logistics, startups, SMEs and enterprise organisations in India.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Industries" }]} eyebrow="Industries we serve" title="IT solutions shaped around how your sector works" intro="Every industry has different priorities for uptime, security, mobility and compliance. Here is how our solutions typically apply." />
      <Section>
        <nav aria-label="Industries" className="mb-12 flex flex-wrap gap-2">
          {industries.map((i) => (
            <a key={i.slug} href={`#${i.slug}`} className="rounded-full border border-navy-200 px-4 py-1.5 text-sm font-medium text-navy-800 hover:border-electric-500 hover:bg-electric-500/10">{i.title}</a>
          ))}
        </nav>
        <div className="space-y-6">
          {industries.map((ind, idx) => (
            <article key={ind.slug} id={ind.slug} className={`grid gap-8 rounded-3xl border border-navy-100 p-7 sm:p-10 lg:grid-cols-[1fr_1.3fr] ${idx % 2 ? "bg-navy-50/50" : "bg-white"}`}>
              <div>
                <IconTile name={ind.icon} size="lg" />
                <h2 className="mt-5 text-2xl font-bold">{ind.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{ind.summary}</p>
              </div>
              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-electric-700 uppercase">Relevant solutions</h3>
                <CheckList items={ind.solutions} />
              </div>
            </article>
          ))}
        </div>
      </Section>
      <CtaBand title="Discuss your industry's IT requirements" />
    </>
  );
}
