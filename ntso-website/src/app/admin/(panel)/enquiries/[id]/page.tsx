import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { AdminHeader, Card, Flash } from "@/components/admin/ui";
import { SaveButton } from "@/components/admin/form-bits";
import { EnquiryStatusBadge } from "@/components/ui/ticket-badges";
import { Badge } from "@/components/ui/notice";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ENQUIRY_LABEL } from "@/lib/server/enquiries";
import { formatDateTime } from "@/lib/format";
import { addEnquiryNote, updateEnquiry } from "@/app/admin/actions";

export const metadata = { title: "Enquiry" };

const mailTone = { SENT: "green", FAILED: "red", NOT_CONFIGURED: "amber", PENDING: "slate" } as const;

export default async function EnquiryDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  await requirePage("enquiries");
  const { id } = await params;
  const sp = await searchParams;
  const [e, staff] = await Promise.all([
    db.enquiry.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } } } }),
    db.adminUser.findMany({ where: { active: true, role: { in: ["ADMIN", "SALES"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!e) notFound();
  const details = (e.details as Record<string, string> | null) || {};
  const rows: [string, string | number | null][] = [
    ["Full name", e.fullName], ["Company", e.companyName], ["Email", e.email], ["Phone", e.phone], ["City", e.city],
    ["Category", e.category], ["Product / license", e.productName], ["Quantity", e.quantity], ["License duration", e.licenseDuration],
    ["Preferred contact", e.preferredContact], ...Object.entries(details), ["Submitted from", e.sourcePage],
  ];
  return (
    <>
      <AdminHeader back={{ href: "/admin/enquiries", label: "All enquiries" }} title={`${e.companyName || e.fullName}`} description={`${e.reference} · ${ENQUIRY_LABEL[e.type]} · received ${formatDateTime(e.createdAt)}`} actions={<EnquiryStatusBadge status={e.status} />} />
      <Flash sp={sp} />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Requirement">
            <p className="text-sm leading-6 whitespace-pre-wrap text-slate-800">{e.requirement}</p>
          </Card>
          <Card title="Details">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium break-words text-navy-900">{String(v)}</dd></div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: your enquiry ${e.reference}`)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"><Mail className="h-4 w-4" aria-hidden="true" /> Email customer</a>
              {e.phone && <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"><Phone className="h-4 w-4" aria-hidden="true" /> Call</a>}
            </div>
          </Card>
          <Card title="Internal notes">
            <form action={addEnquiryNote} className="space-y-3">
              <input type="hidden" name="id" value={e.id} />
              <label htmlFor="note" className="sr-only">Add note</label>
              <textarea id="note" name="body" required rows={3} maxLength={4000} className="input" placeholder="Call summary, quotation sent, next step…" />
              <SaveButton>Add note</SaveButton>
            </form>
            <ul className="mt-5 space-y-3">
              {e.notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-xs text-slate-500">{n.author.name} · {formatDateTime(n.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Status & assignment">
            <form action={updateEnquiry} className="space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" name="status" defaultValue={e.status} className="input">
                  {["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST", "CLOSED"].map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="assignedToId" className="label">Assigned to</label>
                <select id="assignedToId" name="assignedToId" defaultValue={e.assignedToId || ""} className="input">
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <SaveButton />
            </form>
          </Card>
          <Card title="Email notifications">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Sales team</dt><dd><Badge tone={mailTone[e.salesNotification]}>{e.salesNotification.replace("_", " ").toLowerCase()}</Badge></dd></div>
              <div className="flex justify-between"><dt>Customer confirmation</dt><dd><Badge tone={mailTone[e.customerNotification]}>{e.customerNotification.replace("_", " ").toLowerCase()}</Badge></dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
