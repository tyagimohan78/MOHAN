import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/support/ticket-status/", "/request-quote/confirmation", "/media/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
