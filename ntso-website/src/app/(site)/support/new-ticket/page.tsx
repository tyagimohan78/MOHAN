import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Notice } from "@/components/ui/notice";
import { TicketForm } from "@/components/forms/ticket-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Raise a Support Ticket", description: "Submit an IT support ticket to NTSO. You will receive a ticket reference and a private access key to track progress.", path: "/support/new-ticket" });

export default function NewTicketPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Support Center", href: "/support" }, { label: "Raise a ticket" }]} eyebrow="Get IT support" title="Raise a support ticket" intro="The more detail you share, the faster our team can help. You will receive a ticket reference and a private access key." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-10">
            <TicketForm />
          </div>
          <aside className="space-y-4">
            <Notice title="Tips for a quick resolution">
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Include exact error messages or a screenshot</li>
                <li>Mention when the issue started and what changed</li>
                <li>List the affected users, devices or locations</li>
              </ul>
            </Notice>
            <Notice tone="warning" title="Urgent, business-down issue?">Choose “Critical” priority and include a phone number so our team can reach you. Priority is confirmed after review.</Notice>
          </aside>
        </div>
      </Section>
    </>
  );
}
