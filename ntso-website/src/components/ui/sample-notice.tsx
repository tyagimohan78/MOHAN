import { Notice } from "./notice";

export function SampleNotice({ kind = "product" }: { kind?: "product" | "license" }) {
  return (
    <Notice tone="info" title={kind === "license" ? "About these listings" : "About this catalogue"}>
      {kind === "license"
        ? "Listings describe common licensing options to help you start a conversation. Product names, editions, availability and eligibility are set by each vendor and are confirmed with you at quotation. NTSO does not publish prices and never provides license keys outside a legitimate purchase."
        : "Listings are representative examples to help you describe your requirement. Specifications, brands, availability and pricing are confirmed in a written quotation. Stock is not guaranteed."}
    </Notice>
  );
}
