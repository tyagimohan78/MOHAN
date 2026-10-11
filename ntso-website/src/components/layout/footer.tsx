import Link from "next/link";
import { Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { footerNav, site } from "@/lib/site";
import { connection } from "next/server";
import { getSettings } from "@/lib/server/settings";

export async function Footer() {
  // Always render with live settings (also on the otherwise-static 404 page).
  await connection();
  const s = await getSettings();
  const socials = [
    { label: "LinkedIn", href: s.linkedinUrl },
    { label: "Facebook", href: s.facebookUrl },
    { label: "X", href: s.xUrl },
    { label: "Instagram", href: s.instagramUrl },
    { label: "YouTube", href: s.youtubeUrl },
  ].filter((x) => /^https:\/\//.test(x.href));

  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo inverted />
          <p className="mt-5 max-w-sm text-sm leading-6 text-navy-300">
            Business-focused IT solutions across software licensing, hardware procurement, networking, cloud, cybersecurity, surveillance and technical support for organisations in India.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-electric-400" aria-hidden="true" />
              <a href={`mailto:${site.salesEmail}`} className="hover:text-white">{site.salesEmail}</a>
            </li>
            <li className="flex items-center gap-3">
              <User className="h-4 w-4 text-electric-400" aria-hidden="true" />
              <span>Business contact: {site.businessContact}</span>
            </li>
            {s.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-electric-400" aria-hidden="true" />
                <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{s.phone}</a>
              </li>
            )}
            {s.businessHours && (
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-electric-400" aria-hidden="true" />
                <span>{s.businessHours}</span>
              </li>
            )}
            {s.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-electric-400" aria-hidden="true" />
                <span className="whitespace-pre-line">{s.address}</span>
              </li>
            )}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map((x) => (
                <li key={x.label}>
                  <a href={x.href} rel="noopener noreferrer" target="_blank" className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium hover:border-white/40 hover:text-white">
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerNav.map((col) => (
            <div key={col.heading}>
              <h2 className="text-sm font-semibold text-white">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-navy-300 hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-navy-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
            {s.cin && <> · CIN: {s.cin}</>}
            {s.gstin && <> · GSTIN: {s.gstin}</>}
          </p>
          <p className="max-w-2xl md:text-right">
            Product names, logos and brands mentioned on this website are the property of their respective owners and are used for identification only. Their use does not imply endorsement or an authorised partnership unless explicitly stated.
          </p>
        </div>
      </div>
    </footer>
  );
}
