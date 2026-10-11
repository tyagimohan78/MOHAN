import Link from "next/link";
import { AdminHeader, Pager, Table, pageParam } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };
const PER_PAGE = 30;

type Row = { email: string; name: string; company: string | null; phone: string | null; enquiries: number; tickets: number; last: Date };

/** Customer records are derived from enquiries and tickets, grouped by email (no separate customer accounts). */
export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("customers");
  const sp = await searchParams;
  const page = pageParam(sp.page);
  const q = `%${(sp.q || "").trim().slice(0, 100)}%`;
  const rows = await db.$queryRaw<Row[]>`
    WITH people AS (
      SELECT lower(email) AS email, "fullName" AS name, "companyName" AS company, phone, "createdAt", 1 AS enq, 0 AS tic FROM "Enquiry"
      UNION ALL
      SELECT lower(email), "customerName", "companyName", phone, "createdAt", 0, 1 FROM "Ticket"
    )
    SELECT email,
      (array_agg(name ORDER BY "createdAt" DESC))[1] AS name,
      (array_agg(company ORDER BY "createdAt" DESC) FILTER (WHERE company IS NOT NULL))[1] AS company,
      (array_agg(phone ORDER BY "createdAt" DESC) FILTER (WHERE phone IS NOT NULL))[1] AS phone,
      SUM(enq)::int AS enquiries, SUM(tic)::int AS tickets, MAX("createdAt") AS last
    FROM people
    WHERE email ILIKE ${q} OR name ILIKE ${q} OR company ILIKE ${q}
    GROUP BY email
    ORDER BY last DESC
    LIMIT ${PER_PAGE + 1} OFFSET ${(page - 1) * PER_PAGE}`;
  const hasMore = rows.length > PER_PAGE;
  return (
    <>
      <AdminHeader title="Customers" description="Contacts compiled from enquiries and support tickets, grouped by email address." />
      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={sp.q} placeholder="Search name, company or email…" className="input max-w-md" aria-label="Search" />
        <button className={buttonClass("secondary", "md")}>Search</button>
      </form>
      <Table head={["Contact", "Company", "Phone", "Enquiries", "Tickets", "Last activity"]} empty={!rows.length}>
        {rows.slice(0, PER_PAGE).map((r) => (
          <tr key={r.email} className="hover:bg-slate-50">
            <td className="px-4 py-3"><p className="font-medium text-navy-900">{r.name}</p><p className="text-xs text-slate-500">{r.email}</p></td>
            <td className="px-4 py-3 text-slate-600">{r.company || "—"}</td>
            <td className="px-4 py-3 text-slate-600">{r.phone || "—"}</td>
            <td className="px-4 py-3">{r.enquiries > 0 ? <Link className="text-electric-700 hover:underline" href={`/admin/enquiries?q=${encodeURIComponent(r.email)}`}>{r.enquiries}</Link> : 0}</td>
            <td className="px-4 py-3">{r.tickets > 0 ? <Link className="text-electric-700 hover:underline" href={`/admin/tickets?status=all&q=${encodeURIComponent(r.email)}`}>{r.tickets}</Link> : 0}</td>
            <td className="px-4 py-3 text-slate-600">{formatDate(r.last)}</td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={hasMore ? page + 1 : page} params={{ q: sp.q }} />
    </>
  );
}
