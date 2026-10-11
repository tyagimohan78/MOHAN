import { AdminHeader, Pager, Table, pageParam } from "@/components/admin/ui";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };
const PER_PAGE = 50;

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("audit");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const where = sp.action ? { action: { startsWith: sp.action.slice(0, 50) } } : {};
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { user: { select: { name: true, email: true } } } }),
    db.auditLog.count({ where }),
  ]);
  return (
    <>
      <AdminHeader title="Audit log" description="Security-relevant and administrative actions." />
      <form className="mb-4 flex gap-2" role="search">
        <select name="action" defaultValue={sp.action || ""} className="input max-w-xs" aria-label="Action type">
          <option value="">All actions</option>
          {["auth", "enquiry", "ticket", "product", "category", "service", "faq", "settings", "user"].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <button className="rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white">Filter</button>
      </form>
      <Table head={["Time", "User", "Action", "Entity", "IP", "Details"]} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id} className="align-top">
            <td className="px-4 py-2.5 text-xs whitespace-nowrap text-slate-600">{formatDateTime(r.createdAt)}</td>
            <td className="px-4 py-2.5 text-xs">{r.user ? `${r.user.name}` : "—"}</td>
            <td className="px-4 py-2.5 font-mono text-xs">{r.action}</td>
            <td className="px-4 py-2.5 text-xs text-slate-600">{r.entityType}{r.entityId ? ` · ${r.entityId.slice(0, 10)}…` : ""}</td>
            <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.ip}</td>
            <td className="max-w-sm px-4 py-2.5 font-mono text-[11px] break-all text-slate-500">{r.details ? JSON.stringify(r.details) : ""}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER_PAGE)} params={{ action: sp.action }} />
    </>
  );
}
