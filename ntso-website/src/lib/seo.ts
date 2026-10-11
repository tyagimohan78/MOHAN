import type { Metadata } from "next";
import { site } from "./site";

export function pageMetadata({ title, description, path, noIndex = false }: { title: string; description: string; path: string; noIndex?: boolean }): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | ${site.shortName}`, description, url, siteName: site.name, locale: "en_IN", type: "website", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.name }] },
    twitter: { card: "summary_large_image", title: `${title} | ${site.shortName}`, description, images: ["/og-image.png"] },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  email: site.salesEmail,
  areaServed: { "@type": "Country", name: "India" },
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: site.salesEmail, areaServed: "IN", availableLanguage: ["English", "Hindi"] }],
});

export const serviceJsonLd = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  description,
  url: `${site.url}${path}`,
  areaServed: { "@type": "Country", name: "India" },
  provider: { "@type": "Organization", name: site.name, url: site.url },
});

/** Safe JSON-LD serialisation (prevents </script> breakouts). */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
