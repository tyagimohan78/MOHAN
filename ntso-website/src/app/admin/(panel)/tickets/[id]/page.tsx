import { notFound } from "next/navigation";
import { Lock, Paperclip } from "lucide-react";
import { AdminHeader, Card, Flash } from "@/components/admin/ui";
import { Check, SaveButton } from "@/components/admin/form-bits";
import { PriorityBadge, TicketStatusBadge } from "@/components/ui/ticket-badges";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { STATUS_LABEL } from "@/lib/server/tickets";
import { formatBytes, formatDateTime } from "@/lib/format";
import { addTicketMessage, updateTicket } from "@/app/admin/actions";

export const metadata = { title: "Ticket" };

export default async function TicketDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requirePage("tickets");
  const { id } = await params;
  const sp = await searchParams;
  const [t, staff] = await Promise.all([
    db.ticket.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } }, attachments: true } }),
    db.adminUser.findMany({ where: { active: true, role: { in: ["ADMIN", "SUPPORT"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!t) notFound();
  return (
    <>
      <AdminHeader back={{ href: "/admin/tickets", label: "All tickets" }} title={t.subject} description={`${t.reference} · ${t.companyName} · created ${formatDateTime(t.createdAt)} · updated ${formatDateTime(t.updatedAt)}`} actions={<div className="flex gap-2"><PriorityBadge priority={t.priority} /><TicketStatusBadge status={t.status} /></div>} />
      <Flash sp={sp} />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Issue description">
            <p className="text-sm leading-6 whitespace-pre-wrap">{t.description}</p>
            {t.attachments.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {t.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={`/admin/attachments/${a.id}`} className="inline-flex items-center gap-1.5 text-sm text-electric-700 hover:underline"><Paperclip className="h-4 w-4" aria-hidden="true" /> {a.fileName} <span className="text-xs text-slate-500">({formatBytes(a.size)})</span></a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Conversation">
            <ol className="space-y-3">
              {t.messages.map((m) => (
                <li key={m.id} className={`rounded-lg p-3.5 text-sm ${m.internal ? "border border-amber-200 bg-amber-50" : m.authorType === "STAFF" ? "bg-electric-500/10" : m.authorType === "SYSTEM" ? "border border-dashed border-slate-200" : "bg-slate-50"}`}>
                  <p className="flex items-center gap-1.5 text-xs text-slate-600">
                    {m.internal && <Lock className="h-3 w-3" aria-hidden="true" />}
                    {m.authorType === "CUSTOMER" ? `Customer (${t.customerName})` : m.authorType === "SYSTEM" ? "System" : m.author?.name || "Staff"}
                    {m.internal && " · internal note"} · {formatDateTime(m.createdAt)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
            </ol>
            <form action={addTicketMessage} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <input type="hidden" name="id" value={t.id} />
              <label htmlFor="body" className="label">Reply or internal note</label>
              <textarea id="body" name="body" rows={4} required maxLength={6000} className="input" />
              <div className="flex flex-wrap items-center gap-4">
                <Check name="internal" label="Internal note (hidden from customer)" />
                <label className="flex items-center gap-2 text-sm">
                  Set status
                  <select name="setStatus" defaultValue="" className="input w-auto py-1.5">
                    <option value="">Keep current</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </label>
              </div>
              <SaveButton>Post</SaveButton>
              <p className="text-xs text-slate-500">Public replies are emailed to the customer when email is configured.</p>
            </form>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Manage ticket">
            <form action={updateTicket} className="space-y-4">
              <input type="hidden" name="id" value={t.id} />
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" name="status" defaultValue={t.status} className="input">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="label">Priority</label>
                <select id="priority" name="priority" defaultValue={t.priority} className="input">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="assignedToId" className="label">Assigned engineer</label>
                <select id="assignedToId" name="assignedToId" defaultValue={t.assignedToId || ""} className="input">
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <Check name="notify" label="Email customer about status change" defaultChecked />
              <div><SaveButton /></div>
            </form>
          </Card>
          <Card title="Customer">
            <dl className="space-y-2.5 text-sm">
              {[["Name", t.customerName], ["Company", t.companyName], ["Email", t.email], ["Phone", t.phone], ["Category", t.category], ["Affected device / service", t.affectedItem]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium break-words">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
