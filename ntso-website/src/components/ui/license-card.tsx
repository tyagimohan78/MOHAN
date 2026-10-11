import Link from "next/link";
import type { Product } from "@prisma/client";
import { RefreshCw } from "lucide-react";
import { buttonClass } from "./button";

type L = Pick<Product, "slug" | "name" | "vendor" | "shortDescription" | "licenseType" | "subscriptionTerm" | "licensedPer" | "useCase">;

export function LicenseCard({ license, quoteCategory }: { license: L; quoteCategory: string }) {
  const rows: [string, string | null][] = [
    ["License type", license.licenseType],
    ["Subscription term", license.subscriptionTerm],
    ["Licensed per", license.licensedPer],
    ["Use case", license.useCase],
  ];
  const q = new URLSearchParams({ category: quoteCategory, product: license.name }).toString();
  return (
    <article className="flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition hover:border-electric-500/40 hover:shadow-lift">
      {license.vendor && <p className="text-xs font-semibold tracking-wide text-electric-700 uppercase">{license.vendor}</p>}
      <h3 className="mt-1.5 text-lg font-bold">
        <Link href={`/software-licensing/${license.slug}`} className="hover:text-electric-700">
          {license.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{license.shortDescription}</p>
      <dl className="mt-4 flex-1 divide-y divide-navy-100 border-y border-navy-100 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-navy-900">{v}</dd>
            </div>
          ))}
      </dl>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link href={`/request-quote?${q}`} className={buttonClass("primary", "sm")}>
          Request a Quote
        </Link>
        <Link href={`/license-renewal?product=${encodeURIComponent(license.name)}`} className={buttonClass("outline", "sm")}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Renewal Enquiry
        </Link>
      </div>
    </article>
  );
}
