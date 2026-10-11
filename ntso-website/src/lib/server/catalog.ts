import "server-only";
import { cache } from "react";
import { db } from "./db";

export const getHardwareCategories = cache(() =>
  db.productCategory.findMany({ where: { kind: "HARDWARE", published: true }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { published: true } } } } } }),
);

export const getSoftwareCatalog = cache(() =>
  db.productCategory.findMany({
    where: { kind: "SOFTWARE", published: true },
    orderBy: { sortOrder: "asc" },
    include: { products: { where: { published: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  }),
);

export const getCategory = cache((slug: string) =>
  db.productCategory.findFirst({
    where: { slug, published: true },
    include: { products: { where: { published: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
  }),
);

export const getProduct = cache((slug: string) => db.product.findFirst({ where: { slug, published: true }, include: { category: true } }));

export const getServices = cache((pageKey: string) => db.service.findMany({ where: { pageKey, published: true }, orderBy: { sortOrder: "asc" } }));

export const getFaqs = cache((opts?: { home?: boolean }) =>
  db.faq.findMany({ where: { published: true, ...(opts?.home ? { showOnHome: true } : {}) }, orderBy: [{ sortOrder: "asc" }] }),
);

export function groupBy<T, K extends string>(items: T[], key: (t: T) => K): [K, T[]][] {
  const map = new Map<K, T[]>();
  for (const i of items) {
    const k = key(i);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(i);
  }
  return [...map.entries()];
}

export const anchor = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Map a catalogue group to the closest quote-form category. */
export function quoteCategoryFor(group: string): string {
  switch (group) {
    case "Networking Products":
      return "Networking Equipment";
    case "Servers and Storage":
      return "Servers & Storage";
    case "Security and Surveillance":
      return "CCTV & Surveillance";
    case "Microsoft":
      return "Microsoft 365 / Microsoft Software";
    case "Sophos":
      return "Sophos / Endpoint Security";
    case "Other Enterprise Software":
      return "Software Licensing";
    default:
      return "IT Hardware & Devices";
  }
}
