import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { Notice } from "@/components/ui/notice";
import { JsonLd } from "@/components/ui/json-ld";
import { SurveyForm } from "@/components/forms/survey-form";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

const desc = "Network installation services in India: LAN/WAN design, VLANs, enterprise Wi-Fi, VPN, Cat 6/Cat 6A and fibre structured cabling, rack management, server rooms and IT infrastructure audits.";
export const metadata = pageMetadata({ title: "Networking & IT Infrastructure Services", description: desc, path: "/it-services/network-infrastructure" });

const vendors = ["Cisco", "HPE Aruba", "Fortinet", "D-Link", "TP-Link", "Ubiquiti"];

export default async function NetworkPage() {
  const services = await getServices("network");
  return (
    <>
      <PageHero
        crumbs={[{ label: "IT Services", href: "/it-services" }, { label: "Networking & Infrastructure" }]}
        eyebrow="Networking & IT infrastructure"
        title="Structured, documented networks that are easy to run and expand"
        intro="From the first network point to the core switch, we design and deploy business networks with clear documentation — so your team always knows what is installed and why."
        actions={
          <>
            <ButtonLink href="#site-survey" size="lg">Request a site survey <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/request-quote?category=Networking%20%26%20Structured%20Cabling%20Services" size="lg" variant="outline-light">Infrastructure quotation</ButtonLink>
          </>
        }
        aside={<HeroIllustration className="w-full" />}
      />
      <Section>
        <SectionHeader eyebrow="Services" title="What we deliver" intro="Services can be combined into a complete project or taken individually." />
        <ServiceGroups services={services} />
      </Section>
      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeader eyebrow="Enterprise network equipment" title="Multi-vendor experience" intro="We work with equipment from vendors such as these, subject to your technical requirements and product availability. Listing a vendor does not imply an authorised partnership." />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {vendors.map((v) => (
              <li key={v} className="rounded-xl border border-navy-100 bg-white px-4 py-5 text-center font-display font-bold text-navy-800 shadow-card">{v}</li>
            ))}
            <li className="rounded-xl border border-dashed border-navy-200 px-4 py-5 text-center text-sm text-slate-500 sm:col-span-3">and other compatible vendors</li>
          </ul>
        </div>
      </Section>
      <Section id="site-survey">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeader eyebrow="Get started" title="Network consultation, site survey or quotation" intro="Tell us about your site. We will agree the right next step — a call, a site visit or a detailed quotation." />
            <Notice>Survey scope, schedule and any charges are confirmed with you before a visit.</Notice>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <SurveyForm defaultType="Network / cabling site survey" sourcePage="/it-services/network-infrastructure" />
          </div>
        </div>
      </Section>
      <JsonLd data={serviceJsonLd("Networking & IT Infrastructure Services", desc, "/it-services/network-infrastructure")} />
    </>
  );
}
