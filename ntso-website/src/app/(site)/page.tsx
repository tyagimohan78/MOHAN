import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Mail, MessageSquare, Phone, User } from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { ServiceCard, CheckList } from "@/components/ui/cards";
import { Icon, IconTile } from "@/components/ui/icon";
import { FaqList } from "@/components/ui/faq-list";
import { coreCategories, featuredProductCategories, industries, processSteps, whyChoose } from "@/content/marketing";
import { getFaqs } from "@/lib/server/catalog";
import { getSettings } from "@/lib/server/settings";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = {
  ...pageMetadata({
    title: "Enterprise IT Solutions, Software Licensing & IT Support in India",
    description:
      "NTSO Private Limited — IT solutions company in India for Microsoft 365 licensing, Sophos endpoint security, business laptops and servers, network installation, IT AMC, CCTV and Microsoft Azure cloud services. Request a quote.",
    path: "/",
  }),
  title: { absolute: "NTSO Private Limited — Enterprise IT Solutions, Licensing & Support" },
};

export default async function HomePage() {
  const [faqs, settings] = await Promise.all([getFaqs({ home: true }), getSettings()]);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden="true" />
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-navy-600/30 blur-3xl" aria-hidden="true" />
        <div className="absolute right-0 bottom-0 h-[26rem] w-[26rem] rounded-full bg-electric-500/15 blur-3xl" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-electric-300">
              <span className="h-1.5 w-1.5 rounded-full bg-electric-400" aria-hidden="true" /> IT solutions for businesses across India
            </p>
            <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold text-white sm:text-5xl lg:text-[3.4rem]">
              Your Trusted Partner for <span className="bg-gradient-to-r from-electric-300 to-electric-500 bg-clip-text text-transparent">Enterprise IT Solutions</span>, Licensing &amp; Support
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-200">
              NTSO Private Limited helps businesses simplify IT procurement, strengthen cybersecurity, modernize infrastructure, and manage technology with confidence. From software licensing and hardware procurement to networking, cloud solutions, and ongoing technical support, we provide solutions designed around your business needs.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/request-quote" size="lg">
                Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/it-services" size="lg" variant="outline-light">
                Explore Our Services
              </ButtonLink>
              <ButtonLink href={`mailto:${site.salesEmail}?subject=${encodeURIComponent("Sales enquiry")}`} size="lg" variant="outline-light">
                <MessageSquare className="h-4 w-4" aria-hidden="true" /> Talk to Sales
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
              {[
                ["Software", "Licensing & renewals"],
                ["Hardware", "Procurement to deployment"],
                ["Services", "Network, cloud & support"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-display text-base font-bold text-white">{k}</dt>
                  <dd className="mt-1 text-navy-300">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <HeroIllustration className="h-auto w-full drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* CORE CATEGORIES */}
      <Section id="solutions">
        <SectionHeader eyebrow="What we do" title="IT solutions across your entire technology stack" intro="From the licenses on every laptop to the cabling behind the walls, NTSO helps you select, deploy and maintain the technology your business runs on." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coreCategories.map((c) => (
            <ServiceCard key={c.title} icon={c.icon} title={c.title} text={c.text} href={c.href} cta={c.cta} />
          ))}
        </div>
      </Section>

      {/* FEATURED PRODUCTS */}
      <Section tone="muted" id="products">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader eyebrow="Products" title="Hardware and software for every desk, rack and site" intro="Browse product categories and request a quotation. Pricing and availability are confirmed at the time of quotation." />
          <ButtonLink href="/products" variant="outline" className="mb-10 self-start lg:self-auto">
            View all categories <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {featuredProductCategories.map((p) => (
            <li key={p.title}>
              <Link href={p.href} className="group flex h-full flex-col items-start gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-electric-500/40 hover:shadow-lift">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-electric-500/10 text-electric-700 transition group-hover:bg-electric-500 group-hover:text-navy-950">
                  <Icon name={p.icon} className="h-5.5 w-5.5" />
                </span>
                <span className="font-display text-sm font-bold text-navy-900">{p.title}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-electric-700">
                  Request quote <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* WHY NTSO */}
      <Section tone="navy" className="relative overflow-hidden">
        <SectionHeader eyebrow="Why NTSO" title="One accountable partner for business IT" inverted intro="We keep things practical: clear recommendations, written quotations and a single point of contact from enquiry to support." />
        <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((w) => (
            <div key={w.title} className="bg-navy-950 p-6 transition hover:bg-navy-900">
              <Icon name={w.icon} className="h-6 w-6 text-electric-400" />
              <h3 className="mt-4 text-base font-bold text-white">{w.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-300">{w.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* INFRASTRUCTURE */}
      <Section id="infrastructure">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeader eyebrow="IT infrastructure" title="Networks and server rooms built to be understood" intro="Well-designed infrastructure is easier to secure, support and expand. Our network services focus on structure and documentation as much as connectivity." />
            <CheckList
              columns={2}
              items={["LAN/WAN and VLAN design", "Enterprise Wi-Fi deployment", "Cat 6 / Cat 6A and fibre cabling", "Rack installation and cable management", "Firewall and VPN configuration", "Topology and IP documentation"]}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/it-services/network-infrastructure" variant="secondary">
                Networking services
              </ButtonLink>
              <ButtonLink href="/it-services/network-infrastructure#site-survey" variant="outline">
                Request a site survey
              </ButtonLink>
            </div>
          </div>
          <ol className="relative space-y-4 border-l-2 border-dashed border-navy-200 pl-8">
            {processSteps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
                <span className="absolute top-5 -left-[2.95rem] grid h-8 w-8 place-items-center rounded-full bg-navy-900 font-display text-sm font-bold text-electric-400 ring-4 ring-white">{i + 1}</span>
                <h3 className="text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* INDUSTRIES */}
      <Section tone="muted" id="industries">
        <SectionHeader eyebrow="Industries" title="IT solutions shaped around your sector" intro="Different industries face different IT priorities. Here is how our solutions typically apply." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((ind) => (
            <Link key={ind.slug} href={`/industries#${ind.slug}`} className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
              <IconTile name={ind.icon} size="sm" />
              <h3 className="mt-4 text-base font-bold group-hover:text-electric-700">{ind.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{ind.summary}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* CONVERSION: quote + survey */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-800 p-8 sm:p-10">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-electric-500/25 blur-3xl" aria-hidden="true" />
            <ClipboardCheck className="h-10 w-10 text-electric-400" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold text-white">Need a quotation?</h2>
            <p className="mt-3 text-navy-200">Send us your product list, license requirement or project scope. Every enquiry receives a reference number and is reviewed by our sales team.</p>
            <ButtonLink href="/request-quote" size="lg" className="mt-7">
              Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-navy-50/60 p-8 sm:p-10">
            <Building2 className="h-10 w-10 text-navy-700" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold">Planning a new office, network or CCTV system?</h2>
            <p className="mt-3 text-slate-600">Request a site survey. We will understand the site, your users and devices, and recommend a design before you commit.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/it-services/network-infrastructure#site-survey" variant="secondary" size="lg">
                Network site survey
              </ButtonLink>
              <ButtonLink href="/it-services/cctv-surveillance#site-survey" variant="outline" size="lg">
                CCTV site survey
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ + CONTACT */}
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeader eyebrow="FAQs" title="Frequently asked questions" />
            <FaqList items={faqs} />
            <Link href="/faqs" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700 hover:text-navy-900">
              View all FAQs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <aside aria-labelledby="home-contact" className="h-fit rounded-2xl border border-navy-100 bg-white p-7 shadow-card lg:sticky lg:top-32">
            <h2 id="home-contact" className="text-xl font-bold">Contact our team</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-electric-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-navy-900">Sales email</p>
                  <a href={`mailto:${site.salesEmail}`} className="text-electric-700 hover:underline">{site.salesEmail}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <User className="h-5 w-5 text-electric-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-navy-900">Business contact</p>
                  <p>{site.businessContact}</p>
                </div>
              </li>
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone className="h-5 w-5 text-electric-600" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy-900">Phone</p>
                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{settings.phone}</a>
                  </div>
                </li>
              )}
            </ul>
            <div className="mt-6 grid gap-3">
              <ButtonLink href="/contact" variant="secondary">Contact us</ButtonLink>
              <ButtonLink href="/support/new-ticket" variant="outline">Get IT Support</ButtonLink>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
