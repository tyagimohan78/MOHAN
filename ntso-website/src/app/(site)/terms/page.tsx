import { LegalPage } from "@/components/ui/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Terms and Conditions", description: "Terms governing use of the NTSO Private Limited website.", path: "/terms" });

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="[Insert date before launch]" intro="Terms governing the use of this website.">
      <h2>1. Website use</h2>
      <p>By using this website you agree to these terms. The website provides information about {site.name}&apos;s products and services and allows you to submit enquiries and support requests.</p>
      <h2>2. Information on this website</h2>
      <p>Product and service descriptions are for general information. Listings may be representative examples. Specifications, availability, pricing and delivery are confirmed only in a written quotation issued by NTSO.</p>
      <h2>3. Quotations and orders</h2>
      <p>Submitting an enquiry does not create a contract. Any sale or service engagement is governed by the quotation, purchase order and any agreement accepted by both parties. [Add payment, validity and acceptance terms.]</p>
      <h2>4. Third-party products and licenses</h2>
      <p>Software and hardware supplied by NTSO are subject to the manufacturer&apos;s or publisher&apos;s own license terms and warranties. Trademarks belong to their respective owners; references do not imply endorsement or partnership unless explicitly stated.</p>
      <h2>5. Acceptable use</h2>
      <p>You must not misuse the website, attempt unauthorised access, submit malicious files or content, or use automated means to submit forms.</p>
      <h2>6. Limitation of liability</h2>
      <p>[To be drafted by legal counsel.]</p>
      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of India. [Specify jurisdiction.]</p>
      <h2>8. Contact</h2>
      <p><a href={`mailto:${site.salesEmail}`}>{site.salesEmail}</a></p>
    </LegalPage>
  );
}
