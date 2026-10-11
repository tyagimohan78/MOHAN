import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Quote request received", description: "Your quote request has been received by NTSO Private Limited.", path: "/request-quote/confirmation", noIndex: true });

export default async function QuoteConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const reference = ref && /^NTSO-[A-Z]-\d{6}-[A-Z0-9]{6}$/.test(ref) ? ref : null;
  return (
    <Section>
      <div className="mx-auto max-w-2xl py-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
          <CircleCheck className="h-9 w-9 text-emerald-600" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Thank you — your quote request has been received</h1>
        {reference ? (
          <p className="mt-5 text-lg text-slate-700">
            Your enquiry reference is <strong className="rounded-md bg-navy-50 px-2 py-0.5 font-mono text-navy-900">{reference}</strong>
          </p>
        ) : (
          <p className="mt-5 text-slate-600">Your enquiry has been saved.</p>
        )}
        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-navy-100 bg-navy-50/60 p-6 text-left text-sm leading-6 text-slate-700">
          <h2 className="text-base font-bold">What happens next</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Our sales team reviews your requirement.</li>
            <li>We contact you to confirm details such as quantities, configuration and delivery location.</li>
            <li>You receive a written quotation.</li>
          </ol>
          <p className="mt-4">
            A confirmation email is sent to the address you provided when email delivery is enabled. For anything urgent, email{" "}
            <a href={`mailto:${site.salesEmail}${reference ? `?subject=${encodeURIComponent(reference)}` : ""}`} className="font-medium text-electric-700 underline">{site.salesEmail}</a>
            {reference && " quoting your reference"}.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="secondary">Back to home</ButtonLink>
          <ButtonLink href="/software-licensing" variant="outline">Browse software <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Need technical help instead? <Link href="/support/new-ticket" className="font-medium text-electric-700 underline">Raise a support ticket</Link>.
        </p>
      </div>
    </Section>
  );
}
