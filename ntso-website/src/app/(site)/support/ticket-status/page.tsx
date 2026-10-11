import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { Notice } from "@/components/ui/notice";
import { TicketLookupForm } from "@/components/forms/ticket-lookup-form";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMetadata({ title: "Check Ticket Status", description: "Check the status of your NTSO support ticket using your reference number, email and access key.", path: "/support/ticket-status" });

export default function TicketStatusPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Support Center", href: "/support" }, { label: "Ticket status" }]} eyebrow="Support" title="Check your ticket status" intro="Enter your ticket reference, the email used on the ticket and your private access key." />
      <Section>
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
            <TicketLookupForm />
          </div>
          <div className="space-y-4">
            <Notice title="Lost your access key?">For your security we cannot display it again. Reply to your ticket confirmation email or contact our team and we will verify your identity.</Notice>
            <Notice>
              Need help with something new? <Link href="/support/new-ticket" className="font-semibold underline">Raise a new ticket</Link>.
            </Notice>
          </div>
        </div>
      </Section>
    </>
  );
}
