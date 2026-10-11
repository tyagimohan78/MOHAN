import { LegalPage } from "@/components/ui/legal-page";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({ title: "Privacy Policy", description: "How NTSO Private Limited collects, uses and protects personal data submitted through this website.", path: "/privacy-policy" });

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[Insert date before launch]" intro="How we handle personal data submitted through this website.">
      <h2>1. Who we are</h2>
      <p>This website is operated by {site.name} (“NTSO”, “we”, “us”). For privacy questions, contact <a href={`mailto:${site.salesEmail}`}>{site.salesEmail}</a>. [Add registered address and, if appointed, the contact details of the person responsible for data protection / grievance redressal.]</p>
      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Enquiry and quote forms:</strong> name, company, work email, mobile number, city and details of your requirement.</li>
        <li><strong>Support tickets:</strong> name, company, email, phone, issue details and any attachments you choose to upload.</li>
        <li><strong>Technical data:</strong> IP address and browser information used for security, rate-limiting and spam prevention.</li>
      </ul>
      <p>Please do not submit passwords, license keys, payment card details or other sensitive information through website forms.</p>
      <h2>3. How we use information</h2>
      <ul>
        <li>To respond to enquiries, prepare quotations and provide support.</li>
        <li>To send confirmation and service emails related to your request.</li>
        <li>To protect the website against abuse and maintain security records.</li>
        <li>[Add any marketing communications, only with appropriate consent.]</li>
      </ul>
      <h2>4. Legal basis and consent</h2>
      <p>We process personal data on the basis of your consent provided when you submit a form, and for legitimate uses permitted by applicable law, including the Digital Personal Data Protection Act, 2023 and its rules as applicable. [Legal review required.]</p>
      <h2>5. Sharing</h2>
      <p>We do not sell personal data. We may share information with service providers that host this website, deliver email or store files, and with vendors or partners where needed to fulfil your request (for example to register a software subscription). [List categories of processors.]</p>
      <h2>6. Retention</h2>
      <p>We keep enquiry and support records for as long as needed for the purposes above and to meet legal obligations. [Define retention periods.]</p>
      <h2>7. Security</h2>
      <p>We use access controls, encrypted connections (HTTPS), hashed credentials and restricted administrative access to protect information. No method of transmission or storage is completely secure.</p>
      <h2>8. Your rights</h2>
      <p>Subject to applicable law, you may request access to, correction of, or erasure of your personal data, and may withdraw consent. Contact <a href={`mailto:${site.salesEmail}`}>{site.salesEmail}</a>.</p>
      <h2>9. Cookies</h2>
      <p>This website uses only essential cookies — for example to keep administrators signed in and to let customers view their own support tickets. No advertising cookies are used. [Update if analytics are added.]</p>
      <h2>10. Changes</h2>
      <p>We may update this policy. The “last updated” date shows the latest version.</p>
    </LegalPage>
  );
}
