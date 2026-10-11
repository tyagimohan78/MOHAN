import { Clock, FileText, Mail, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { QuoteForm } from "@/components/forms/quote-form";
import { pageMetadata } from "@/lib/seo";
import { quoteCategories, site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Request a Quote",
  description: "Request a quotation from NTSO Private Limited for software licenses, IT hardware, networking, cloud, cybersecurity, CCTV or IT AMC services.",
  path: "/request-quote",
});

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ category?: string; product?: string }> }) {
  const sp = await searchParams;
  const category = (quoteCategories as readonly string[]).includes(sp.category || "") ? sp.category : undefined;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Request a Quote" }]}
        eyebrow="Sales enquiry"
        title="Request a quote"
        intro="Share your requirement and our sales team will respond with options and a written quotation. All fields marked * are required."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <QuoteForm defaults={{ category, productName: sp.product?.slice(0, 200) }} />
          </div>
          <aside className="space-y-5">
            {[
              { Icon: FileText, t: "Reference number", d: "Every enquiry receives a unique reference so you can follow up easily." },
              { Icon: Clock, t: "What happens next", d: "Our team reviews your requirement and contacts you using your preferred method to clarify details before quoting." },
              { Icon: ShieldCheck, t: "Your data", d: "Details are stored securely and used only to respond to your enquiry. Never include passwords or license keys." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-4 rounded-2xl border border-navy-100 p-5">
                <Icon className="h-6 w-6 shrink-0 text-electric-600" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold">{t}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{d}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-navy-950 p-6 text-navy-200">
              <Mail className="h-6 w-6 text-electric-400" aria-hidden="true" />
              <p className="mt-3 text-sm">Prefer email? Send your requirement or BOQ to</p>
              <a href={`mailto:${site.salesEmail}`} className="mt-1 block font-display text-lg font-bold text-white hover:underline">{site.salesEmail}</a>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
