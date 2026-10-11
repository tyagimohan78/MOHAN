import Link from "next/link";
import { Download } from "lucide-react";
import { AdminHeader, Flash, Pager, Table, pageParam } from "@/components/admin/ui";
import { EnquiryStatusBadge } from "@/components/ui/ticket-badges";
import { Badge } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ENQUIRY_LABEL, ENQUIRY_STATUSES as STATUSES, ENQUIRY_TYPES as TYPES, enquiryWhere } from "@/lib/server/enquiries";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Enquiries" };
const PER_PAGE = 25;

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("enquiries");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const where = enquiryWhere(sp);
  const [rows, total] = await Promise.all([
    db.enquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { assignedTo: { select: { name: true } } } }),
    db.enquiry.count({ where }),
  ]);
  const exportQs = new URLSearchParams(Object.fromEntries(Object.entries({ type: sp.type, status: sp.status, q: sp.q }).filter(([, v]) => v)) as Record<string, string>).toString();
  return (
    <>
      <AdminHeader
        title="Enquiries & leads"
        description={`${total} enquir${total === 1 ? "y" : "ies"} — quotes, contact messages, renewals, site surveys and consultations.`}
        actions={<a href={`/admin/enquiries/export?${exportQs}`} className={buttonClass("outline", "sm")}><Download className="h-4 w-4" aria-hidden="true" /> Export CSV</a>}
      />
      <Flash sp={sp} />
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto]" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search reference, name, company, email, product…" className="input" aria-label="Search" />
        <select name="type" defaultValue={sp.type || ""} className="input" aria-label="Type">
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{ENQUIRY_LABEL[t]}</option>)}
        </select>
        <select name="status" defaultValue={sp.status || ""} className="input" aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
        <button className={buttonClass("secondary", "md")}>Filter</button>
      </form>
      <Table head={["Reference", "Received", "Type", "Customer", "Category / product", "Assigned", "Status"]} empty={!rows.length}>
        {rows.map((e) => (
          <tr key={e.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-xs"><Link href={`/admin/enquiries/${e.id}`} className="text-electric-700 hover:underline">{e.reference}</Link></td>
            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(e.createdAt)}</td>
            <td className="px-4 py-3">{ENQUIRY_LABEL[e.type]}</td>
            <td className="px-4 py-3"><p className="font-medium text-navy-900">{e.companyName || "—"}</p><p className="text-xs text-slate-500">{e.fullName} · {e.email}</p></td>
            <td className="max-w-xs px-4 py-3"><p className="truncate">{e.category}</p><p className="truncate text-xs text-slate-500">{e.productName}{e.quantity ? ` × ${e.quantity}` : ""}</p></td>
            <td className="px-4 py-3 text-slate-600">{e.assignedTo?.name || "—"}</td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-1"><EnquiryStatusBadge status={e.status} />{e.salesNotification === "FAILED" && <Badge tone="red">Email failed</Badge>}</div></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER_PAGE)} params={{ q: sp.q, type: sp.type, status: sp.status, mail: sp.mail }} />
    </>
  );
}
