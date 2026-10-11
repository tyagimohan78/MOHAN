import Link from "next/link";
import { AdminHeader, Card, Flash, Stat } from "@/components/admin/ui";
import { EnquiryStatusBadge, PriorityBadge, TicketStatusBadge } from "@/components/ui/ticket-badges";
import { Notice } from "@/components/ui/notice";
import { can, requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { emailConfigured, config } from "@/lib/server/config";
import { formatDateTime } from "@/lib/format";
import { ENQUIRY_LABEL } from "@/lib/server/enquiries";

export const metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requirePage();
  const sp = await searchParams;
  const showSales = can(user.role, "enquiries");
  const showSupport = can(user.role, "tickets");
  const [newEnq, openEnq, failedMail, openTickets, critical, waiting, recentEnq, recentTickets, products] = await Promise.all([
    showSales ? db.enquiry.count({ where: { status: "NEW" } }) : 0,
    showSales ? db.enquiry.count({ where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED", "QUOTED"] } } }) : 0,
    showSales ? db.enquiry.count({ where: { salesNotification: "FAILED" } }) : 0,
    showSupport ? db.ticket.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }) : 0,
    showSupport ? db.ticket.count({ where: { priority: "CRITICAL", status: { notIn: ["RESOLVED", "CLOSED"] } } }) : 0,
    showSupport ? db.ticket.count({ where: { status: "WAITING_FOR_CUSTOMER" } }) : 0,
    showSales ? db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 6 }) : [],
    showSupport ? db.ticket.findMany({ where: { status: { notIn: ["CLOSED"] } }, orderBy: { updatedAt: "desc" }, take: 6 }) : [],
    can(user.role, "catalog") ? db.product.count({ where: { isSample: true, published: true } }) : 0,
  ]);
  return (
    <>
      <AdminHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Overview of enquiries, support tickets and website configuration." />
      <Flash sp={sp} />
      {user.role === "ADMIN" && (
        <div className="mb-6 space-y-3">
          {!emailConfigured() && <Notice tone="warning" title="Email delivery is not configured">Enquiries and tickets are saved, but notification emails to {config.salesNotifyEmail} and customers are not being sent. Configure SMTP_* environment variables.</Notice>}
          {products > 0 && <Notice title={`${products} sample catalogue listings are published`}>Review sample products and licenses before launch and untick “Sample listing” once verified.</Notice>}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showSales && <Stat label="New enquiries" value={newEnq} href="/admin/enquiries?status=NEW" tone="cyan" />}
        {showSales && <Stat label="Open sales pipeline" value={openEnq} href="/admin/enquiries" />}
        {showSales && failedMail > 0 && <Stat label="Enquiries with failed email" value={failedMail} href="/admin/enquiries?mail=FAILED" tone="red" />}
        {showSupport && <Stat label="Open tickets" value={openTickets} href="/admin/tickets" />}
        {showSupport && <Stat label="Critical open tickets" value={critical} href="/admin/tickets?priority=CRITICAL" tone="red" />}
        {showSupport && <Stat label="Waiting for customer" value={waiting} href="/admin/tickets?status=WAITING_FOR_CUSTOMER" tone="amber" />}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {showSales && (
          <Card title="Latest enquiries" actions={<Link href="/admin/enquiries" className="text-sm text-electric-700 hover:underline">View all</Link>}>
            <ul className="divide-y divide-slate-100">
              {recentEnq.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/enquiries/${e.id}`} className="min-w-0 hover:underline">
                    <p className="truncate text-sm font-medium text-navy-900">{e.companyName || e.fullName} · {ENQUIRY_LABEL[e.type]}</p>
                    <p className="text-xs text-slate-500">{e.reference} · {formatDateTime(e.createdAt)}</p>
                  </Link>
                  <EnquiryStatusBadge status={e.status} />
                </li>
              ))}
              {!recentEnq.length && <li className="py-6 text-center text-sm text-slate-500">No enquiries yet.</li>}
            </ul>
          </Card>
        )}
        {showSupport && (
          <Card title="Recently updated tickets" actions={<Link href="/admin/tickets" className="text-sm text-electric-700 hover:underline">View all</Link>}>
            <ul className="divide-y divide-slate-100">
              {recentTickets.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/tickets/${t.id}`} className="min-w-0 hover:underline">
                    <p className="truncate text-sm font-medium text-navy-900">{t.subject}</p>
                    <p className="text-xs text-slate-500">{t.reference} · {t.companyName}</p>
                  </Link>
                  <div className="flex shrink-0 gap-1.5"><PriorityBadge priority={t.priority} /><TicketStatusBadge status={t.status} /></div>
                </li>
              ))}
              {!recentTickets.length && <li className="py-6 text-center text-sm text-slate-500">No open tickets.</li>}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
