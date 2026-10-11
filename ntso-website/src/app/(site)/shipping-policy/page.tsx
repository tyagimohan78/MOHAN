import { LegalPage } from "@/components/ui/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Shipping and Delivery Policy", description: "Delivery terms for products supplied by NTSO Private Limited.", path: "/shipping-policy" });

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping and Delivery Policy" updated="[Insert date before launch]">
      <p>Products are currently supplied against quotations and purchase orders; this website does not take online payments.</p>
      <h2>Delivery terms</h2>
      <ul>
        <li>Delivery location, estimated timelines and charges (if any) are stated in your quotation.</li>
        <li>Timelines depend on manufacturer and distributor availability and are estimates unless otherwise agreed in writing.</li>
        <li>Please inspect deliveries and report visible damage or shortages at the time of delivery. [Define reporting window.]</li>
      </ul>
      <h2>Software and subscriptions</h2>
      <p>Licenses and subscriptions are delivered electronically — for example, provisioned to your tenant or vendor portal — as described in the quotation.</p>
      <p>[Review and customise if online ordering is introduced.]</p>
    </LegalPage>
  );
}
