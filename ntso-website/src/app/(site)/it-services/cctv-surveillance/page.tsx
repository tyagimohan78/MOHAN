import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { Notice } from "@/components/ui/notice";
import { FeatureCard } from "@/components/ui/cards";
import { JsonLd } from "@/components/ui/json-ld";
import { SurveyForm } from "@/components/forms/survey-form";
import { Icon } from "@/components/ui/icon";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

const desc = "CCTV installation for offices, factories and warehouses: IP and analog cameras, NVR/DVR configuration, storage planning, camera placement and annual maintenance contracts.";
export const metadata = pageMetadata({ title: "CCTV & Surveillance Installation", description: desc, path: "/it-services/cctv-surveillance" });

export default async function CctvPage() {
  const services = await getServices("cctv");
  return (
    <>
      <PageHero
        crumbs={[{ label: "IT Services", href: "/it-services" }, { label: "CCTV & Surveillance" }]}
        eyebrow="CCTV & physical security"
        title="Surveillance systems planned for coverage, retention and security"
        intro="IP and analog CCTV for offices, factories and warehouses — with camera placement, network design and storage sized to your retention needs."
        actions={
          <>
            <ButtonLink href="#site-survey" size="lg">Request a CCTV Site Survey <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/products/ip-cctv-cameras" size="lg" variant="outline-light">CCTV products</ButtonLink>
          </>
        }
        aside={
          <div className="grid aspect-square max-w-xs place-items-center justify-self-end rounded-3xl border border-white/10 bg-white/5">
            <Icon name="cctv" className="h-28 w-28 text-electric-400" />
          </div>
        }
      />
      <Section>
        <SectionHeader eyebrow="Services" title="CCTV services" />
        <ServiceGroups services={services} />
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Responsible surveillance" title="Security and privacy built in" />
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon="lock" title="Authorised remote access only">Remote viewing is configured only with your written authorisation, using strong unique passwords, updated firmware and restricted access.</FeatureCard>
          <FeatureCard icon="network" title="Segmented camera networks">Cameras and recorders are placed on separate VLANs where possible to limit exposure.</FeatureCard>
          <FeatureCard icon="users" title="Privacy-aware placement">Placement avoids areas where people expect privacy, and signage is recommended where appropriate.</FeatureCard>
        </div>
      </Section>
      <Section id="site-survey">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeader eyebrow="Site survey" title="Request a CCTV site survey" intro="Share the site details and what you want to monitor. We will contact you to plan the survey." />
            <Notice>Survey scope, schedule and any charges are confirmed before a visit.</Notice>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <SurveyForm defaultType="CCTV site survey" sourcePage="/it-services/cctv-surveillance" />
          </div>
        </div>
      </Section>
      <JsonLd data={serviceJsonLd("CCTV & Surveillance Installation", desc, "/it-services/cctv-surveillance")} />
    </>
  );
}
