import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { FaqList } from "@/components/ui/faq-list";
import { CtaBand } from "@/components/ui/cta-band";
import { getFaqs, groupBy, anchor } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Frequently Asked Questions", description: "Answers to common questions about quotations, software licensing, IT services and support at NTSO Private Limited.", path: "/faqs" });

export default async function FaqsPage() {
  const faqs = await getFaqs();
  const groups = groupBy(faqs, (f) => f.category);
  return (
    <>
      <PageHero crumbs={[{ label: "FAQs" }]} eyebrow="FAQs" title="Frequently asked questions" intro="Quick answers about quotations, licensing, services and support." />
      <Section>
        <div className="mx-auto max-w-3xl space-y-12">
          {groups.map(([g, items]) => (
            <section key={g} id={anchor(g)}>
              <h2 className="mb-5 text-xl font-bold">{g}</h2>
              <FaqList items={items} withSchema={false} />
            </section>
          ))}
        </div>
      </Section>
      <CtaBand title="Still have a question?" text="Our team is happy to help." primary={{ label: "Contact us", href: "/contact" }} />
    </>
  );
}
