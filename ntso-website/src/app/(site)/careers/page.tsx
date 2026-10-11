import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Careers", description: "Careers at NTSO Private Limited — IT infrastructure, support and sales roles.", path: "/careers" });

export default function CareersPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Careers" }]} eyebrow="Careers" title="Work with NTSO" intro="We are interested in hearing from people who enjoy solving real-world IT problems for businesses." />
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">No open positions are listed right now</h2>
          <p className="mt-3 text-slate-600">
            Experienced in networking, Microsoft 365 administration, end-user support or B2B IT sales? Send your CV with the role you are interested in. We will contact you if there is a suitable opening.
          </p>
          <ButtonLink href={`mailto:${site.salesEmail}?subject=${encodeURIComponent("Careers – CV")}`} className="mt-6">Email your CV</ButtonLink>
          <p className="mt-4 text-xs text-slate-500">Please do not send documents such as Aadhaar, PAN or bank details at this stage.</p>
        </div>
      </Section>
    </>
  );
}
