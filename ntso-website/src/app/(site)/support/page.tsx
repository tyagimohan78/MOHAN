import Link from "next/link";
import { ArrowRight, FileSearch, LifeBuoy, TicketPlus } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ServiceGroups } from "@/components/ui/service-groups";
import { Notice } from "@/components/ui/notice";
import { FaqList } from "@/components/ui/faq-list";
import { getFaqs, getServices } from "@/lib/server/catalog";
import { getSettings } from "@/lib/server/settings";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Support Center — IT Support & Managed Services",
  description: "Raise an IT support ticket, check ticket status, and explore remote and on-site IT support, Microsoft 365 administration, network and server support from NTSO.",
  path: "/support",
});

export default async function SupportPage() {
  const [services, faqs, settings] = await Promise.all([getServices("support"), getFaqs(), getSettings()]);
  const supportFaqs = faqs.filter((f) => f.category === "Support");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Support Center" }]}
        eyebrow="Support Center"
        title="How can we help?"
        intro="Raise a support ticket, follow its progress online, or learn about our support and managed services."
        actions={
          <>
            <ButtonLink href="/support/new-ticket" size="lg"><TicketPlus className="h-4 w-4" aria-hidden="true" /> Raise a ticket</ButtonLink>
            <ButtonLink href="/support/ticket-status" size="lg" variant="outline-light"><FileSearch className="h-4 w-4" aria-hidden="true" /> Check ticket status</ButtonLink>
          </>
        }
      />
      <Section>
        {settings.supportNote && <Notice className="mb-8" title="Support notice">{settings.supportNote}</Notice>}
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { href: "/support/new-ticket", Icon: TicketPlus, t: "Raise a support ticket", d: "Describe the issue, attach screenshots and receive a ticket reference and private access key." },
            { href: "/support/ticket-status", Icon: FileSearch, t: "Check ticket status", d: "View updates and reply using your reference number, email and access key." },
            { href: "/it-services/amc-plans", Icon: LifeBuoy, t: "AMC & managed support", d: "Scheduled maintenance and support agreements with defined scope." },
          ].map(({ href, Icon, t, d }) => (
            <Link key={href} href={href} className="group rounded-2xl border border-navy-100 bg-white p-7 shadow-card transition hover:-translate-y-0.5 hover:border-electric-500/40 hover:shadow-lift">
              <Icon className="h-8 w-8 text-electric-600" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold">{t}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{d}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-electric-700">Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
        <Notice className="mt-8" title="Response times">
          Response and resolution targets depend on your support agreement. Customers without an agreement are supported on a best-effort basis after the ticket is reviewed.
          {settings.businessHours && <> Support desk hours: {settings.businessHours}.</>}
        </Notice>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="IT support & managed services" title="What our support covers" />
        <ServiceGroups services={services} columns={3} />
      </Section>
      {supportFaqs.length > 0 && (
        <Section>
          <div className="mx-auto max-w-3xl">
            <SectionHeader eyebrow="FAQs" title="Support questions" />
            <FaqList items={supportFaqs} />
          </div>
        </Section>
      )}
    </>
  );
}
