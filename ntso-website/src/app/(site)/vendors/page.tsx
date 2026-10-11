import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { Section, SectionHeader } from "@/components/ui/section";
import { Notice } from "@/components/ui/notice";
import { CtaBand } from "@/components/ui/cta-band";
import { anchor, getHardwareCategories, getSoftwareCatalog, groupBy } from "@/lib/server/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Vendors & Product Categories", description: "Technology vendors and product categories NTSO can help source, subject to availability and licensing authorisation.", path: "/vendors" });

const vendorGroups = [
  { title: "Software & cloud", vendors: ["Microsoft", "Sophos", "ESET", "Bitdefender", "Veeam", "Acronis", "VMware by Broadcom", "Fortinet"] },
  { title: "Networking & security", vendors: ["Cisco", "HPE Aruba", "Fortinet", "Sophos", "Ubiquiti", "D-Link", "TP-Link"] },
  { title: "Computing, servers & printing", vendors: ["Dell", "HP", "HPE", "Lenovo", "Apple", "ASUS", "Acer", "Canon", "Epson", "Brother"] },
  { title: "Storage & surveillance", vendors: ["Synology", "QNAP", "Western Digital", "Seagate", "Axis Communications", "Hanwha Vision", "CP Plus"] },
];

export default async function VendorsPage() {
  const [hw, sw] = await Promise.all([getHardwareCategories(), getSoftwareCatalog()]);
  return (
    <>
      <PageHero crumbs={[{ label: "Vendors & Categories" }]} eyebrow="Vendors & categories" title="Brands and categories we can help source" intro="A multi-vendor approach lets us recommend what fits your requirement rather than a single brand." />
      <Section>
        <Notice title="Important">
          Vendor names are listed to show the technology we work with and can help procure, subject to product availability and the applicable licensing or distribution authorisation. Listing a brand does not indicate an official partnership, reseller status or endorsement. Trademarks belong to their respective owners.
        </Notice>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {vendorGroups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-navy-100 p-6">
              <h2 className="text-lg font-bold">{g.title}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.vendors.map((v) => (
                  <li key={v} className="rounded-lg bg-navy-50 px-3 py-1.5 text-sm font-medium text-navy-800">{v}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="muted">
        <SectionHeader eyebrow="Categories" title="Product categories" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {groupBy(hw, (c) => c.group).map(([g, cats]) => (
            <div key={g}>
              <h3 className="font-bold"><Link href={`/products#${anchor(g)}`} className="hover:text-electric-700">{g}</Link></h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {cats.map((c) => (<li key={c.id}><Link href={`/products/${c.slug}`} className="text-slate-600 hover:text-electric-700 hover:underline">{c.name}</Link></li>))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="font-bold"><Link href="/software-licensing" className="hover:text-electric-700">Software &amp; Licensing</Link></h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {sw.map((c) => (<li key={c.id}><Link href={`/software-licensing#${c.slug}`} className="text-slate-600 hover:text-electric-700 hover:underline">{c.name}</Link></li>))}
            </ul>
          </div>
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
