export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/ui/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/server/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      {s.announcement && (
        <div className="bg-navy-900 px-4 py-2 text-center text-sm text-navy-100" role="note">
          {s.announcement}
        </div>
      )}
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <JsonLd data={organizationJsonLd()} />
    </>
  );
}
