import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import { JsonLd } from "./json-ld";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, inverted = false }: { items: Crumb[]; inverted?: boolean }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={`flex flex-wrap items-center gap-1 text-sm ${inverted ? "text-navy-300" : "text-slate-500"}`}>
          {all.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className={`hover:underline ${inverted ? "hover:text-white" : "hover:text-navy-900"}`}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={i === all.length - 1 ? "page" : undefined} className={inverted ? "text-white" : "text-navy-900"}>
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? `${site.url}${c.href === "/" ? "" : c.href}` : undefined })),
        }}
      />
    </>
  );
}
