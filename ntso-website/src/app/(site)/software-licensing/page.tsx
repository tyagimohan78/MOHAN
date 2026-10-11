import { ArrowRight, RefreshCw } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { LicenseCard } from "@/components/ui/license-card";
import { SampleNotice } from "@/components/ui/sample-notice";
import { CtaBand } from "@/components/ui/cta-band";
import { FeatureCard } from "@/components/ui/cards";
import { Icon } from "@/components/ui/icon";
import { getSoftwareCatalog, quoteCategoryFor } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Software Licensing — Microsoft 365, Windows, Sophos & More",
  description: "Microsoft 365 licensing for businesses, Windows 11 Pro, Windows Server, SQL Server, Azure, Sophos Endpoint Security, firewall, backup and other enterprise software. Request a quote or renewal.",
  path: "/software-licensing",
});

const sections = [
  { id: "microsoft", group: "Microsoft", title: "Microsoft products", intro: "Microsoft 365, Windows, Server, SQL, Azure and Microsoft security — with guidance on choosing the right plans for your users." },
  { id: "sophos", group: "Sophos", title: "Sophos security products", intro: "Endpoint, XDR, MDR, firewall, email and network security from Sophos, managed through Sophos Central." },
  { id: "other-software", group: "Other Enterprise Software", title: "Other enterprise software", intro: "Endpoint security, backup and DR, virtualisation, IT operations tools and productivity software from established vendors, subject to availability and licensing authorisation." },
];

export default async function SoftwareLicensingPage() {
  const catalog = await getSoftwareCatalog();
  return (
    <>
      <PageHero
        crumbs={[{ label: "Software & Licensing" }]}
        eyebrow="Software & licensing"
        title="Business software licensing, renewals and subscription management"
        intro="Get the right licenses for your users and devices — and keep them renewed on time. We help you compare plans, stay compliant and consolidate renewals."
        actions={
          <>
            <ButtonLink href="/request-quote?category=Software%20Licensing" size="lg">Request a license quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/license-renewal" size="lg" variant="outline-light"><RefreshCw className="h-4 w-4" aria-hidden="true" /> License renewal</ButtonLink>
          </>
        }
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon="audit" title="Plan selection">We map your users, devices and security needs to the appropriate plans and editions.</FeatureCard>
          <FeatureCard icon="renew" title="Renewals & true-ups">Renew on time, adjust user counts and align expiry dates where vendors allow.</FeatureCard>
          <FeatureCard icon="file-key" title="Legitimate licensing only">Licenses are supplied only through legitimate vendor or distribution channels. We never provide keys or activation methods outside a valid purchase.</FeatureCard>
        </div>
        <nav aria-label="Software sections" className="mt-12 flex flex-wrap gap-2">
          {catalog.map((c) => (
            <a key={c.id} href={`#${c.slug}`} className="rounded-full border border-navy-200 px-4 py-1.5 text-sm font-medium text-navy-800 hover:border-electric-500 hover:bg-electric-500/10">
              {c.name}
            </a>
          ))}
        </nav>
        <div className="mt-8">
          <SampleNotice kind="license" />
        </div>
      </Section>
      {sections.map((s, i) => {
        const cats = catalog.filter((c) => c.group === s.group);
        if (!cats.length) return null;
        return (
          <Section key={s.id} id={s.id} tone={i % 2 === 0 ? "muted" : "white"}>
            <SectionHeader eyebrow={s.group} title={s.title} intro={s.intro} />
            <div className="space-y-14">
              {cats.map((c) => (
                <div key={c.id} id={c.slug}>
                  <h3 className="flex items-center gap-3 text-xl font-bold">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy-900 text-electric-400">
                      <Icon name={c.icon} className="h-4.5 w-4.5" />
                    </span>
                    {c.name}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">{c.description}</p>
                  <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {c.products.map((p) => (
                      <li key={p.id}>
                        <LicenseCard license={p} quoteCategory={quoteCategoryFor(c.group)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        );
      })}
      <CtaBand title="Not sure which license you need?" text="Tell us how many users and devices you have and what they need to do. We will recommend suitable plans and explain the options." primary={{ label: "Ask for a recommendation", href: "/request-quote?category=Software%20Licensing" }} secondary={{ label: "Renew a license", href: "/license-renewal" }} />
    </>
  );
}
