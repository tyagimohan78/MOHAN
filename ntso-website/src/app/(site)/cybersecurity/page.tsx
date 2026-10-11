import { ArrowRight, ShieldAlert } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { Badge, Notice } from "@/components/ui/notice";
import { JsonLd } from "@/components/ui/json-ld";
import { QuoteForm } from "@/components/forms/quote-form";
import { Icon } from "@/components/ui/icon";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

const desc = "Firewall and endpoint security solutions for businesses: endpoint protection, EDR, XDR, MDR, firewall configuration, email security, MFA, Microsoft security configuration and backup planning.";
export const metadata = pageMetadata({ title: "Cybersecurity Services — Endpoint, Firewall & Email Security", description: desc, path: "/cybersecurity" });

export default async function CybersecurityPage() {
  const services = await getServices("cybersecurity");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Cybersecurity" }]}
        eyebrow="Cybersecurity"
        title="Practical security for endpoints, networks, email and identities"
        intro="We help businesses put proven security controls in place — and make sure they are configured correctly. Where specialist services are needed, we coordinate with qualified partners."
        actions={
          <>
            <ButtonLink href="#security-enquiry" size="lg">Discuss your requirement <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/software-licensing#sophos" size="lg" variant="outline-light">Security licensing</ButtonLink>
          </>
        }
        aside={
          <div className="grid aspect-square max-w-xs place-items-center justify-self-end rounded-3xl border border-white/10 bg-white/5">
            <Icon name="shield-check" className="h-28 w-28 text-electric-400" />
          </div>
        }
      />
      <Section>
        <SectionHeader eyebrow="Services" title="Security services" intro="Each service is marked to show how it is delivered." />
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/60 p-4 text-sm">
          <span className="font-semibold text-navy-900">Legend:</span>
          <span className="flex items-center gap-2">No badge — delivered directly by NTSO</span>
          <span className="flex items-center gap-2"><Badge tone="slate">NTSO and/or partner</Badge></span>
          <span className="flex items-center gap-2"><Badge tone="amber">Delivered via partner</Badge> — NTSO coordinates; the partner or vendor delivers</span>
        </div>
        <ServiceGroups services={services} showDelivery />
      </Section>
      <Section tone="muted" id="security-enquiry">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeader eyebrow="Security enquiry" title="Tell us what you want to protect" intro="Describe your environment at a high level — number of users and devices, email platform, firewall and any current security tools." />
            <Notice tone="warning" title="Do not share secrets">
              <p className="flex gap-2"><ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> Never include passwords, VPN details, firewall configurations, IP addresses of sensitive systems, vulnerability details or license keys in this form. We will arrange secure channels if they are needed.</p>
            </Notice>
            <Notice className="mt-4" title="Suspect an active incident?">
              Isolate affected devices from the network and contact your incident response provider or the relevant authority (in India, CERT-In). We can help coordinate, but we do not offer an emergency incident response hotline through this website.
            </Notice>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <QuoteForm defaults={{ category: "Cybersecurity Services" }} sourcePage="/cybersecurity" />
          </div>
        </div>
      </Section>
      <JsonLd data={serviceJsonLd("Cybersecurity Services", desc, "/cybersecurity")} />
    </>
  );
}
