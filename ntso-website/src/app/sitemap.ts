import { logger } from "@/lib/server/logger";
import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const staticPaths = [
  "", "/about", "/products", "/software-licensing", "/license-renewal", "/it-services", "/it-services/network-infrastructure", "/it-services/cctv-surveillance",
  "/it-services/amc-plans", "/it-services/it-procurement", "/cloud-solutions", "/cybersecurity", "/industries", "/support", "/support/new-ticket",
  "/support/ticket-status", "/contact", "/request-quote", "/vendors", "/faqs", "/privacy-policy", "/terms", "/shipping-policy", "/returns-policy", "/warranty-rma", "/careers",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
  try {
    const [cats, products] = await Promise.all([
      db.productCategory.findMany({ where: { published: true, kind: "HARDWARE" }, select: { slug: true, updatedAt: true } }),
      db.product.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, category: { select: { slug: true, kind: true } } } }),
    ]);
    for (const c of cats) entries.push({ url: `${site.url}/products/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 });
    for (const p of products) {
      const url = p.category.kind === "SOFTWARE" ? `${site.url}/software-licensing/${p.slug}` : `${site.url}/products/${p.category.slug}/${p.slug}`;
      entries.push({ url, lastModified: p.updatedAt, priority: 0.5 });
    }
  } catch (err) {
    logger.error("sitemap.db_unavailable", {}, err);
  }
  return entries;
}
