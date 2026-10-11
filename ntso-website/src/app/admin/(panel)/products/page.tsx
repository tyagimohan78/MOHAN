import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { AdminHeader, Flash, Pager, Table, pageParam } from "@/components/admin/ui";
import { Badge } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export const metadata = { title: "Products & licenses" };
const PER_PAGE = 30;

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("catalog");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const where: Prisma.ProductWhereInput = {};
  if (sp.kind === "HARDWARE" || sp.kind === "SOFTWARE") where.category = { kind: sp.kind };
  if (sp.sample === "1") where.isSample = true;
  const q = sp.q?.trim().slice(0, 100);
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { vendor: { contains: q, mode: "insensitive" } }, { slug: { contains: q } }];
  const [rows, total] = await Promise.all([
    db.product.findMany({ where, include: { category: { select: { name: true, kind: true } } }, orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }], skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.product.count({ where }),
  ]);
  return (
    <>
      <AdminHeader title="Products & licenses" description={`${total} items. Prices are intentionally not stored — the website uses quotation-based sales.`} actions={<Link href="/admin/products/new" className={buttonClass("primary", "sm")}><Plus className="h-4 w-4" aria-hidden="true" /> New product</Link>} />
      <Flash sp={sp} />
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_auto_auto]" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search name, vendor, slug…" className="input" aria-label="Search" />
        <select name="kind" defaultValue={sp.kind || ""} className="input" aria-label="Type">
          <option value="">Hardware & software</option><option value="HARDWARE">Hardware</option><option value="SOFTWARE">Software & licensing</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sample" value="1" defaultChecked={sp.sample === "1"} className="accent-electric-600" /> Sample only</label>
        <button className={buttonClass("secondary", "md")}>Filter</button>
      </form>
      <Table head={["Name", "Category", "Vendor", "Flags", "Updated"]} empty={!rows.length}>
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50">
            <td className="px-4 py-3"><Link href={`/admin/products/${p.id}`} className="font-medium text-navy-900 hover:underline">{p.name}</Link><p className="font-mono text-xs text-slate-500">{p.slug}</p></td>
            <td className="px-4 py-3 text-slate-600">{p.category.name}<p className="text-xs">{p.category.kind === "SOFTWARE" ? "Software" : "Hardware"}</p></td>
            <td className="max-w-[14rem] truncate px-4 py-3 text-slate-600">{p.vendor || "—"}</td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{p.published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Draft</Badge>}{p.featured && <Badge tone="cyan">Featured</Badge>}{p.isSample && <Badge tone="amber">Sample</Badge>}</div></td>
            <td className="px-4 py-3 text-xs whitespace-nowrap text-slate-500">{p.updatedAt.toISOString().slice(0, 10)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER_PAGE)} params={{ q: sp.q, kind: sp.kind, sample: sp.sample }} />
    </>
  );
}
