import Link from "next/link";
import { LegalPage } from "@/components/ui/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Warranty and RMA Information", description: "How warranty claims and RMA requests are handled for products supplied by NTSO.", path: "/warranty-rma" });

export default function WarrantyPage() {
  return (
    <LegalPage title="Warranty and RMA Information" updated="[Insert date before launch]" intro="How we help with warranty claims and return merchandise authorisations.">
      <h2>Manufacturer warranties</h2>
      <p>Hardware is covered by the manufacturer&apos;s warranty as specified for each product and stated in your quotation or invoice. Warranty type (on-site, carry-in, or return-to-base) and duration vary by manufacturer and model.</p>
      <h2>How to raise a warranty or RMA request</h2>
      <ol className="my-3 list-decimal space-y-1.5 pl-6">
        <li><Link href="/support/new-ticket">Raise a support ticket</Link> and choose the relevant category.</li>
        <li>Include the product model, serial number, invoice reference and a description of the fault.</li>
        <li>Our team helps with basic troubleshooting and coordinates the claim with the manufacturer or its service centre.</li>
      </ol>
      <h2>What is typically not covered</h2>
      <ul>
        <li>Physical, liquid or electrical damage, and unauthorised repairs.</li>
        <li>Consumables such as toner, ink and batteries (unless the manufacturer states otherwise).</li>
        <li>Data loss — please back up data before devices are serviced.</li>
      </ul>
      <p>Final warranty decisions are made by the manufacturer.</p>
    </LegalPage>
  );
}
