import Link from "next/link";
import { notFound } from "next/navigation";
import { Paperclip } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { Notice } from "@/components/ui/notice";
import { TicketStatusBadge, PriorityBadge } from "@/components/ui/ticket-badges";
import { TicketReplyForm } from "@/components/forms/ticket-reply-form";
import { buttonClass } from "@/components/ui/button";
import { db } from "@/lib/server/db";
import { getCustomerTicketFromCookie } from "@/lib/server/tickets";
import { pageMetadata } from "@/lib/seo";
import { formatDateTime } from "@/lib/format";

export const metadata = pageMetadata({ title: "Ticket details", description: "Support ticket details", path: "/support/ticket-status", noIndex: true });

export default async function TicketDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!/^NTSO-T-\d{6}-[A-Z0-9]{6}$/.test(reference)) notFound();
  // Authorisation: the access cookie is re-verified (reference + email + key hash) on every request.
  const ticketId = await getCustomerTicketFromCookie(reference);
  if (!ticketId) {
    return (
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-bold">Please verify access to this ticket</h1>
          <p className="mt-3 text-slate-600">For your privacy, ticket details are shown only after you enter the reference, email and access key.</p>
          <Link href="/support/ticket-status" className={buttonClass("primary", "md", "mt-6")}>Look up ticket</Link>
        </div>
      </Section>
    );
  }
  const t = await db.ticket.findUnique({
    where: { id: ticketId },
    include: {
      messages: { where: { internal: false }, orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      attachments: { select: { id: true, fileName: true, size: true } },
    },
  });
  if (!t) notFound();
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/60">
        <div className="container-page py-6">
          <Breadcrumbs items={[{ label: "Support Center", href: "/support" }, { label: "Ticket status", href: "/support/ticket-status" }, { label: t.reference }]} />
        </div>
      </section>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="font-mono text-sm text-slate-500">{t.reference}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t.subject}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <TicketStatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
            </div>
            <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-500">Original request</h2>
              <p className="mt-2 leading-7 whitespace-pre-wrap">{t.description}</p>
              {t.attachments.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  {t.attachments.map((a) => (
                    <li key={a.id} className="flex items-center gap-1 rounded-md bg-navy-50 px-2 py-1"><Paperclip className="h-3 w-3" aria-hidden="true" />{a.fileName}</li>
                  ))}
                </ul>
              )}
            </div>
            <h2 className="mt-10 text-lg font-bold">Updates</h2>
            <ol className="mt-4 space-y-4">
              {t.messages.map((m) => (
                <li key={m.id} className={`rounded-2xl border p-5 ${m.authorType === "STAFF" ? "border-electric-500/30 bg-electric-500/5" : m.authorType === "SYSTEM" ? "border-dashed border-navy-200 bg-navy-50/50" : "border-navy-100 bg-white"}`}>
                  <p className="text-xs font-semibold text-slate-500">
                    {m.authorType === "STAFF" ? `NTSO Support${m.author?.name ? ` · ${m.author.name}` : ""}` : m.authorType === "SYSTEM" ? "System" : "You"} · {formatDateTime(m.createdAt)}
                  </p>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-800">{m.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6">
              {t.status === "CLOSED" ? (
                <Notice>This ticket is closed. <Link href="/support/new-ticket" className="font-semibold underline">Raise a new ticket</Link> if you need more help.</Notice>
              ) : (
                <TicketReplyForm reference={t.reference} />
              )}
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="text-base font-bold">Ticket details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Company", t.companyName],
                ["Category", t.category],
                ["Affected device / service", t.affectedItem],
                ["Created", formatDateTime(t.createdAt)],
                ["Last updated", formatDateTime(t.updatedAt)],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}
