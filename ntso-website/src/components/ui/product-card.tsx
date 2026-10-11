import Link from "next/link";
import type { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { Icon } from "./icon";

export function ProductCard({ product, href, icon }: { product: Pick<Product, "name" | "vendor" | "shortDescription" | "imageUrl" | "imageAlt">; href: string; icon: string }) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-electric-500/40 hover:shadow-lift">
      <div className="relative grid aspect-[16/9] place-items-center overflow-hidden bg-gradient-to-br from-navy-50 to-navy-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded images served from /media
          <img src={product.imageUrl} alt={product.imageAlt || product.name} className="h-full w-full object-contain p-4" loading="lazy" />
        ) : (
          <>
            <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
            <Icon name={icon} className="relative h-14 w-14 text-navy-400 transition group-hover:scale-105 group-hover:text-electric-600" />
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {product.vendor && <p className="text-xs font-semibold tracking-wide text-electric-700 uppercase">{product.vendor}</p>}
        <h3 className="mt-1.5 text-base font-bold">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900">
          View details &amp; request quote <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
