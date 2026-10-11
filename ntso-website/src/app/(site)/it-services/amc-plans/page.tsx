import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { CheckList } from "@/components/ui/cards";
import { Notice } from "@/components/ui/notice";
import { ServiceGroups } from "@/components/ui/service-groups";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/ui/json-ld";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

const desc = "IT AMC services for desktops, laptops, printers, networks, servers and CCTV. Non-comprehensive, comprehensive and managed support models, scoped after an asset assessment.";
export const metadata = pageMetadata({ title: "IT AMC Plans & Managed Support", description: desc, path: "/it-services/amc-plans" });

const models = [
  {
    name: "Non-comprehensive AMC",
    summary: "Preventive maintenance and labour for covered assets. Spare parts are quoted separately when needed.",
    items: ["Scheduled preventive maintenance visits", "Break-fix labour for covered assets", "Remote assistance for common issues", "Parts quoted and approved before replacement"],
  },
  {
    name: "Comprehensive AMC",
    summary: "Preventive maintenance and labour, with agreed categories of spare parts included in the contract.",
    items: ["Everything in non-comprehensive AMC", "Specified spare parts included as per contract", "Exclusions (e.g. consumables, physical damage) defined in writing", "Asset condition reporting"],
    featured: true,
  },
  {
    name: "Managed IT support",
    summary: "Ongoing user and infrastructure support for organisations without a full in-house IT team.",
    items: ["Helpdesk via the NTSO Support Center", "Microsoft 365 and user administration", "Patch and endpoint security health checks", "Periodic reviews and recommendations"],
  },
];

export default async function AmcPage() {
  const services = await getServices("support");
  return (
    <>
      <PageHero
        crumbs={[{ label: "IT Services", href: "/it-services" }, { label: "IT AMC Plans" }]}
        eyebrow="IT AMC & managed support"
        title="Annual maintenance contracts tailored to your IT assets"
        intro="Keep devices, networks and servers healthy with scheduled maintenance and a clear support process. Every AMC is scoped after reviewing your assets."
        actions={<ButtonLink href="/request-quote?category=IT%20AMC%20%26%20Managed%20Support" size="lg">Request an AMC proposal <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>}
      />
      <Section>
        <SectionHeader eyebrow="AMC models" title="Choose the model that fits" intro="These are the common contract models. Final scope, covered assets, visit frequency and response targets are agreed in your contract." />
        <div className="grid gap-6 lg:grid-cols-3">
          {models.map((m) => (
            <div key={m.name} className={`relative flex flex-col rounded-2xl border p-7 ${m.featured ? "border-electric-500 bg-navy-950 text-navy-200 shadow-lift" : "border-navy-100 bg-white shadow-card"}`}>
              {m.featured && <span className="absolute -top-3 left-7 rounded-full bg-electric-500 px-3 py-0.5 text-xs font-bold text-navy-950">Broadest coverage</span>}
              <h3 className={`text-xl font-bold ${m.featured ? "text-white" : ""}`}>{m.name}</h3>
              <p className={`mt-2 text-sm leading-6 ${m.featured ? "text-navy-300" : "text-slate-600"}`}>{m.summary}</p>
              <div className="mt-6 flex-1">
                <CheckList items={m.items} inverted={m.featured} />
              </div>
              <ButtonLink href={`/request-quote?category=IT%20AMC%20%26%20Managed%20Support&product=${encodeURIComponent(m.name)}`} variant={m.featured ? "primary" : "outline"} className="mt-7">
                Request a proposal
              </ButtonLink>
            </div>
          ))}
        </div>
        <Notice className="mt-8" title="No generic SLA promises">
          Response and resolution targets are defined in each contract based on location, asset types and coverage hours — not as a general website commitment.
        </Notice>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Coverage" title="Support services that can be included" />
        <ServiceGroups services={services} columns={3} />
      </Section>
      <Section>
        <SectionHeader eyebrow="How it works" title="From assessment to contract" />
        <ol className="grid gap-5 md:grid-cols-4">
          {["Share your asset list or request an assessment", "We review assets, locations and support needs", "You receive a written AMC proposal with scope and exclusions", "Maintenance begins and tickets are tracked in the Support Center"].map((t, i) => (
            <li key={t} className="rounded-2xl border border-navy-100 p-6">
              <span className="font-display text-3xl font-extrabold text-electric-700">0{i + 1}</span>
              <p className="mt-3 text-sm leading-6 text-slate-700">{t}</p>
            </li>
          ))}
        </ol>
      </Section>
      <CtaBand title="Get an AMC proposal" text="Send us your asset list (devices, printers, network and server equipment) and locations." primary={{ label: "Request an AMC proposal", href: "/request-quote?category=IT%20AMC%20%26%20Managed%20Support" }} />
      <JsonLd data={serviceJsonLd("IT AMC & Managed Support", desc, "/it-services/amc-plans")} />
    </>
  );
}
