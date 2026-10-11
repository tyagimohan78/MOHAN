import { LegalPage } from "@/components/ui/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Returns and Refunds Policy", description: "Returns and refunds information for NTSO Private Limited.", path: "/returns-policy" });

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns and Refunds Policy" updated="[Insert date before launch]">
      <p>Return and refund eligibility depends on the product, the manufacturer&apos;s or publisher&apos;s policies and the terms in your quotation or agreement.</p>
      <h2>Hardware</h2>
      <ul>
        <li>Dead-on-arrival or damaged items must be reported within [X] days of delivery.</li>
        <li>Items must be returned in original packaging with all accessories. [Define conditions.]</li>
        <li>Faults after acceptance are handled under the manufacturer&apos;s warranty — see <a href="/warranty-rma">Warranty &amp; RMA</a>.</li>
      </ul>
      <h2>Software and subscriptions</h2>
      <p>Many licenses and subscriptions are non-cancellable and non-refundable once provisioned, as set by the vendor. Cancellation windows, where offered by the vendor, are communicated at quotation.</p>
      <h2>Services</h2>
      <p>Refunds for services are governed by the applicable service agreement.</p>
    </LegalPage>
  );
}
