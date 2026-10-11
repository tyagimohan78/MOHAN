import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ServiceCard } from "@/components/ui/cards";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/ui/cta-band";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "IT Services — Networking, CCTV, IT AMC & Procurement",
  description: "Network installation services, LAN cabling and rack management, CCTV installation for offices and factories, IT AMC services and enterprise IT procurement from NTSO.",
  path: "/it-services",
});

const services = [
  { icon: "network", title: "Networking & IT Infrastructure", text: "LAN/WAN, VLANs, enterprise Wi-Fi, VPN, structured cabling, racks, server rooms and infrastructure audits.", href: "/it-services/network-infrastructure" },
  { icon: "cctv", title: "CCTV & Surveillance", text: "IP and analog CCTV installation, NVR/DVR configuration, storage planning and maintenance.", href: "/it-services/cctv-surveillance" },
  { icon: "wrench", title: "IT AMC Plans", text: "Annual maintenance contracts with preventive maintenance and agreed support scope.", href: "/it-services/amc-plans" },
  { icon: "procurement", title: "Enterprise IT Procurement", text: "Requirement mapping, multi-brand options and consolidated quotations for hardware, software and services.", href: "/it-services/it-procurement" },
  { icon: "cloud", title: "Cloud Solutions", text: "Microsoft Azure and Microsoft 365 — identity, migration, backup and ongoing management.", href: "/cloud-solutions" },
  { icon: "shield-check", title: "Cybersecurity", text: "Endpoint, firewall, email and identity security implementation and configuration.", href: "/cybersecurity" },
  { icon: "headset", title: "IT Support & Managed Services", text: "Remote and on-site support for users, devices, Microsoft 365, networks and servers.", href: "/support" },
  { icon: "key", title: "Software Licensing", text: "Microsoft, Sophos and other software — procurement, renewals and plan guidance.", href: "/software-licensing" },
];

export default function ItServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "IT Services" }]}
        eyebrow="IT services"
        title="IT services that keep your business connected, secure and supported"
        intro="Design, deployment and ongoing support for the infrastructure your teams depend on every day."
        actions={<ButtonLink href="/request-quote" size="lg">Discuss your project <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>}
      />
      <Section>
        <SectionHeader eyebrow="Services" title="Choose a service area" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.href} {...s} />
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
