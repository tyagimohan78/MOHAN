import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { CheckList } from "@/components/ui/cards";
import { Notice } from "@/components/ui/notice";
import { RenewalForm } from "@/components/forms/renewal-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "License Renewal",
  description: "Renew Microsoft 365, Sophos, antivirus, backup and other business software subscriptions. Submit a license renewal enquiry to NTSO.",
  path: "/license-renewal",
});

export default async function LicenseRenewalPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Software & Licensing", href: "/software-licensing" }, { label: "License Renewal" }]}
        eyebrow="License renewal"
        title="Renew your software subscriptions without the last-minute rush"
        intro="Tell us what is due for renewal. We will review the current options — including user-count changes and edition upgrades — and send you a quotation."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What to include</h2>
            <CheckList items={["Vendor and product or subscription name", "Number of users or devices", "Current expiry date", "Any planned change in users, devices or edition", "Who you purchased from previously (optional)"]} />
            <Notice tone="warning" title="Keep secrets private">
              Do not share license keys, tenant admin passwords or portal credentials in this form or by email. If administrative access is needed, it will be arranged securely.
            </Notice>
            <Notice>Renewal pricing and terms are set by each vendor and may differ from your previous term. We confirm the details before you place an order.</Notice>
          </div>
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <RenewalForm defaultProduct={product?.slice(0, 200)} />
          </div>
        </div>
      </Section>
    </>
  );
}
