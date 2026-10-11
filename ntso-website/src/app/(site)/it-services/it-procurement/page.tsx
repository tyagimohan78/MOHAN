import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { CtaBand } from "@/components/ui/cta-band";
import { FeatureCard } from "@/components/ui/cards";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Enterprise IT Procurement",
  description: "Business laptop and desktop procurement, servers, networking and software licensing through one point of contact, with consolidated quotations and renewal tracking.",
  path: "/it-services/it-procurement",
});

export default async function ProcurementPage() {
  const services = await getServices("procurement");
  return (
    <>
      <PageHero
        crumbs={[{ label: "IT Services", href: "/it-services" }, { label: "Enterprise IT Procurement" }]}
        eyebrow="Enterprise IT procurement"
        title="One point of contact for business IT purchasing"
        intro="Reduce the effort of buying technology. We translate requirements into specifications, compare options and consolidate hardware, software and services into one quotation."
        actions={<ButtonLink href="/request-quote?category=Enterprise%20IT%20Procurement" size="lg">Share your requirement <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>}
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon="procurement" title="Specify correctly">Avoid over- or under-buying with specifications matched to actual workloads.</FeatureCard>
          <FeatureCard icon="file" title="Compare clearly">Options presented side by side so internal approvals are faster.</FeatureCard>
          <FeatureCard icon="renew" title="Plan renewals">Warranty and subscription dates recorded so renewals are not missed.</FeatureCard>
        </div>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Scope" title="What procurement support includes" />
        <ServiceGroups services={services} columns={3} />
      </Section>
      <CtaBand title="Send us your BOQ or requirement list" text="We accept bills of quantities, spreadsheets or a simple description of what you need." />
    </>
  );
}
