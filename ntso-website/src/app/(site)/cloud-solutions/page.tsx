import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { FeatureCard } from "@/components/ui/cards";
import { CtaBand } from "@/components/ui/cta-band";
import { JsonLd } from "@/components/ui/json-ld";
import { Icon } from "@/components/ui/icon";
import { getServices } from "@/lib/server/catalog";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

const desc = "Microsoft Azure cloud services and Microsoft 365 for businesses in India: cloud identity, migration, backup, disaster recovery, hybrid infrastructure, security configuration and cost optimisation.";
export const metadata = pageMetadata({ title: "Cloud Solutions — Microsoft Azure & Microsoft 365", description: desc, path: "/cloud-solutions" });

const benefits = [
  { icon: "rocket", title: "Scale when you need to", text: "Add users, storage or servers without waiting for hardware." },
  { icon: "users", title: "Work from anywhere", text: "Secure access to email, files and apps for office, hybrid and field teams." },
  { icon: "archive", title: "Resilience", text: "Cloud backup and disaster recovery options reduce the impact of local failures." },
  { icon: "shield-check", title: "Built-in security controls", text: "Identity protection, MFA and Conditional Access — when properly configured." },
];

const distinctions = [
  { icon: "key", title: "Cloud subscription licensing", text: "Purchasing the right Microsoft 365 or Azure subscriptions for your users and workloads. You pay the vendor-defined subscription or consumption charges.", href: "/software-licensing#microsoft", cta: "Licensing options" },
  { icon: "route", title: "Cloud migration", text: "A one-time project to move email, files or servers to the cloud — including planning, data transfer, cut-over and user communication.", href: "/request-quote?category=Cloud%20Solutions%20(Azure%20%2F%20Microsoft%20365)&product=Cloud%20migration", cta: "Plan a migration" },
  { icon: "cloud-cog", title: "Ongoing cloud management", text: "Continuing administration after go-live: user changes, security reviews, monitoring, backup checks and cost optimisation under an agreed scope.", href: "/request-quote?category=Cloud%20Solutions%20(Azure%20%2F%20Microsoft%20365)&product=Managed%20cloud", cta: "Discuss management" },
];

export default async function CloudPage() {
  const services = await getServices("cloud");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Cloud Solutions" }]}
        eyebrow="Cloud solutions"
        title="Microsoft cloud, set up properly and managed with care"
        intro="We focus on Microsoft Azure and the Microsoft 365 ecosystem — helping you license, migrate, secure and manage cloud services that your teams rely on."
        actions={
          <>
            <ButtonLink href="/request-quote?category=Cloud%20Solutions%20(Azure%20%2F%20Microsoft%20365)" size="lg">Talk to a cloud specialist <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/software-licensing#microsoft-365" size="lg" variant="outline-light">Microsoft 365 plans</ButtonLink>
          </>
        }
        aside={
          <div className="grid aspect-square max-w-xs place-items-center justify-self-end rounded-3xl border border-white/10 bg-white/5">
            <Icon name="cloud" className="h-28 w-28 text-electric-400" />
          </div>
        }
      />
      <Section>
        <SectionHeader eyebrow="Why cloud" title="Benefits of cloud adoption for businesses" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <FeatureCard key={b.title} icon={b.icon} title={b.title}>{b.text}</FeatureCard>
          ))}
        </div>
      </Section>
      <Section tone="navy">
        <SectionHeader eyebrow="Know what you are buying" title="Licensing, migration and management are different things" inverted intro="Many cloud projects stall because these are mixed up. We quote and deliver them separately so the scope is always clear." />
        <div className="grid gap-5 lg:grid-cols-3">
          {distinctions.map((d, i) => (
            <div key={d.title} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-7">
              <span className="font-display text-sm font-bold text-electric-400">0{i + 1}</span>
              <Icon name={d.icon} className="mt-4 h-8 w-8 text-electric-400" />
              <h3 className="mt-4 text-lg font-bold text-white">{d.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-navy-300">{d.text}</p>
              <ButtonLink href={d.href} variant="outline-light" size="sm" className="mt-6 self-start">{d.cta}</ButtonLink>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Services" title="Cloud services we provide" />
        <ServiceGroups services={services} columns={3} />
      </Section>
      <CtaBand title="Planning a move to Microsoft 365 or Azure?" text="Tell us about your current email, file storage and servers. We will suggest a practical path and scope." />
      <JsonLd data={serviceJsonLd("Microsoft Azure & Microsoft 365 Cloud Services", desc, "/cloud-solutions")} />
    </>
  );
}
