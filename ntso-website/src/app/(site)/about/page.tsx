import { ArrowRight, Mail, User } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { FeatureCard, CheckList } from "@/components/ui/cards";
import { CtaBand } from "@/components/ui/cta-band";
import { IconTile } from "@/components/ui/icon";
import { industries } from "@/content/marketing";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "About Us",
  description: "NTSO Private Limited delivers business-oriented IT solutions across software licensing, hardware procurement, networking, cybersecurity, cloud, surveillance and technical support.",
  path: "/about",
});

const capabilities = [
  { icon: "key", title: "Software licensing", text: "Microsoft, Sophos and other enterprise software — new subscriptions, renewals and license guidance." },
  { icon: "laptop", title: "Hardware procurement", text: "End-user devices, servers, storage, printers, networking and surveillance equipment." },
  { icon: "network", title: "Networking & infrastructure", text: "Network design, structured cabling, Wi-Fi, racks and server room organisation." },
  { icon: "shield-check", title: "Cybersecurity", text: "Endpoint, firewall, email and identity security, deployed and configured for your environment." },
  { icon: "cloud", title: "Cloud", text: "Microsoft Azure and Microsoft 365 setup, migration, security configuration and management." },
  { icon: "headset", title: "Support & AMC", text: "Remote and on-site technical support and annual maintenance contracts." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "About Us" }]}
        eyebrow="About NTSO"
        title="Technology that helps organisations operate efficiently and grow confidently"
        intro="NTSO Private Limited brings software, hardware, connectivity, security and support together through one customer-focused team."
        actions={
          <>
            <ButtonLink href="/contact" size="lg">Contact our team <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="/it-services" size="lg" variant="outline-light">Our services</ButtonLink>
          </>
        }
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeader eyebrow="Company overview" title="Who we are" />
            <div className="space-y-5 text-lg leading-8 text-slate-700">
              <p>
                NTSO Private Limited is focused on delivering business-oriented IT solutions across software licensing, IT hardware procurement, networking, cybersecurity, cloud technologies, surveillance systems, and technical support. Our goal is to help organizations select, deploy, maintain, and manage the technology they need to operate efficiently and grow confidently.
              </p>
              <p>
                We aim to simplify IT procurement and infrastructure management by bringing together software, hardware, connectivity, security, and support services through a customer-focused approach.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl bg-navy-950 p-7 text-navy-200">
              <p className="eyebrow text-electric-400">Our mission</p>
              <p className="mt-3 font-display text-xl leading-8 font-semibold text-white">
                To make business technology simpler to buy, safer to run and easier to support — so our customers can focus on their own work.
              </p>
            </div>
            <div className="rounded-2xl border border-navy-100 p-7">
              <p className="eyebrow">Business contact</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-3"><User className="h-4 w-4 text-electric-600" aria-hidden="true" /> {site.businessContact}</li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-electric-600" aria-hidden="true" /> <a className="text-electric-700 hover:underline" href={`mailto:${site.salesEmail}`}>{site.salesEmail}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Our approach" title="How we work with customers" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon="audit" title="Understand first">We start with your users, sites, applications and constraints before recommending products.</FeatureCard>
          <FeatureCard icon="file" title="Clear, written proposals">Quotations state configuration, quantities and terms so decisions are easy to review internally.</FeatureCard>
          <FeatureCard icon="workflow" title="Deploy with documentation">Configurations, network diagrams and asset details are documented and handed over.</FeatureCard>
          <FeatureCard icon="lifebuoy" title="Stay accountable">One point of contact for support, warranty coordination and renewals.</FeatureCard>
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Service capabilities" title="What we can help with" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="flex gap-4 rounded-2xl border border-navy-100 p-6">
              <IconTile name={c.icon} size="sm" />
              <div>
                <h3 className="text-base font-bold">{c.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Industries served" title="Organisations we work with" />
        <CheckList columns={2} items={industries.map((i) => i.title)} />
        <Link href="/industries" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700 hover:text-navy-900">
          How we support each industry <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Section>
      <CtaBand title="Talk to our team" text="Tell us about your organisation and what you would like to improve. We will suggest a practical next step." primary={{ label: "Contact us", href: "/contact" }} />
    </>
  );
}
