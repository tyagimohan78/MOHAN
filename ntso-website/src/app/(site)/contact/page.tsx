import Link from "next/link";
import { ArrowRight, Clock, Headset, Mail, MapPin, Phone, User } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/contact-form";
import { getSettings } from "@/lib/server/settings";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Contact Us", description: "Contact NTSO Private Limited — email sales@NTSO.in or send a message for software licensing, IT hardware, networking, cloud, cybersecurity and support enquiries.", path: "/contact" });

export default async function ContactPage() {
  const s = await getSettings();
  const mapOk = /^https:\/\/(www\.)?google\.com\/maps\/embed\?/.test(s.mapEmbedUrl);
  return (
    <>
      <PageHero crumbs={[{ label: "Contact Us" }]} eyebrow="Contact" title="Talk to NTSO" intro="Questions, quotations or support — reach the right team quickly." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-5">
            <div className="rounded-2xl bg-navy-950 p-7 text-navy-200">
              <h2 className="font-display text-xl font-bold text-white">{site.name}</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3"><Mail className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Sales email</p><a className="font-semibold text-white hover:underline" href={`mailto:${site.salesEmail}`}>{site.salesEmail}</a></div></li>
                <li className="flex gap-3"><User className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Business contact</p><p className="font-semibold text-white">{site.businessContact}</p></div></li>
                <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Website</p><a className="font-semibold text-white hover:underline" href={site.url}>{site.displayDomain}</a></div></li>
                {s.phone && <li className="flex gap-3"><Phone className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Phone</p><a className="font-semibold text-white hover:underline" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a></div></li>}
                {s.businessHours && <li className="flex gap-3"><Clock className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Business hours</p><p className="font-semibold text-white">{s.businessHours}</p></div></li>}
                {s.address && <li className="flex gap-3"><MapPin className="h-5 w-5 text-electric-400" aria-hidden="true" /><div><p className="text-navy-400">Address</p><p className="font-semibold whitespace-pre-line text-white">{s.address}</p></div></li>}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link href="/request-quote" className="flex items-center justify-between rounded-2xl border border-navy-100 p-5 hover:border-electric-500/40 hover:shadow-card">
                <span><span className="block font-bold text-navy-900">Sales enquiry</span><span className="text-sm text-slate-600">Request a quotation</span></span>
                <ArrowRight className="h-5 w-5 text-electric-600" aria-hidden="true" />
              </Link>
              <Link href="/support/new-ticket" className="flex items-center justify-between rounded-2xl border border-navy-100 p-5 hover:border-electric-500/40 hover:shadow-card">
                <span><span className="block font-bold text-navy-900">IT support</span><span className="text-sm text-slate-600">Raise a support ticket</span></span>
                <Headset className="h-5 w-5 text-electric-600" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-2 mb-8 text-slate-600">For quotations, the <Link href="/request-quote" className="font-medium text-electric-700 underline">quote form</Link> captures everything our sales team needs.</p>
            <ContactForm />
          </div>
        </div>
        {mapOk && s.address && (
          <div className="mt-12 overflow-hidden rounded-3xl border border-navy-100">
            <iframe title="NTSO office location" src={s.mapEmbedUrl} className="h-96 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={`mailto:${site.salesEmail}`} variant="secondary"><Mail className="h-4 w-4" aria-hidden="true" /> Email {site.salesEmail}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
