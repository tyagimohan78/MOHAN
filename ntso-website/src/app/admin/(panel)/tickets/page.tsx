import Link from "next/link";
import type { Prisma, TicketPriority, TicketStatus } from "@prisma/client";
import { AdminHeader, Flash, Pager, Table, pageParam } from "@/components/admin/ui";
import { PriorityBadge, TicketStatusBadge } from "@/components/ui/ticket-badges";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { STATUS_LABEL } from "@/lib/server/tickets";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Support tickets" };
const PER_PAGE = 25;
const STATUSES = Object.keys(STATUS_LABEL) as TicketStatus[];
const PRIORITIES: TicketPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requirePage("tickets");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const where: Prisma.TicketWhereInput = {};
  if (sp.status === "active" || !sp.status) where.status = { notIn: ["RESOLVED", "CLOSED"] };
  else if (STATUSES.includes(sp.status as TicketStatus)) where.status = sp.status as TicketStatus;
  if (sp.priority && PRIORITIES.includes(sp.priority as TicketPriority)) where.priority = sp.priority as TicketPriority;
  if (sp.mine === "1") where.assignedToId = user.id;
  const q = sp.q?.trim().slice(0, 100);
  if (q) where.OR = ["reference", "customerName", "companyName", "email", "subject"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } }));
  const [rows, total] = await Promise.all([
    db.ticket.findMany({ where, orderBy: [{ updatedAt: "desc" }], skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { assignedTo: { select: { name: true } } } }),
    db.ticket.count({ where }),
  ]);
  return (
    <>
      <AdminHeader title="Support tickets" description={`${total} ticket${total === 1 ? "" : "s"} matching filters.`} />
      <Flash sp={sp} />
      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_1fr_1fr_auto_auto]" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search reference, customer, company, subject…" className="input" aria-label="Search" />
        <select name="status" defaultValue={sp.status || "active"} className="input" aria-label="Status">
          <option value="active">Active (not resolved/closed)</option>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select name="priority" defaultValue={sp.priority || ""} className="input" aria-label="Priority">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="mine" value="1" defaultChecked={sp.mine === "1"} className="accent-electric-600" /> Assigned to me</label>
        <button className={buttonClass("secondary", "md")}>Filter</button>
      </form>
      <Table head={["Reference", "Subject", "Customer", "Category", "Priority", "Status", "Assigned", "Updated"]} empty={!rows.length}>
        {rows.map((t) => (
          <tr key={t.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-xs"><Link href={`/admin/tickets/${t.id}`} className="text-electric-700 hover:underline">{t.reference}</Link></td>
            <td className="max-w-xs px-4 py-3"><Link href={`/admin/tickets/${t.id}`} className="block truncate font-medium text-navy-900 hover:underline">{t.subject}</Link></td>
            <td className="px-4 py-3"><p>{t.companyName}</p><p className="text-xs text-slate-500">{t.customerName}</p></td>
            <td className="px-4 py-3 text-slate-600">{t.category}</td>
            <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
            <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
            <td className="px-4 py-3 text-slate-600">{t.assignedTo?.name || "—"}</td>
            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(t.updatedAt)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER_PAGE)} params={{ q: sp.q, status: sp.status, priority: sp.priority, mine: sp.mine }} />
    </>
  );
}
