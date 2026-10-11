import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Card, Flash, Table } from "@/components/admin/ui";
import { ServiceForm, SERVICE_PAGES } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteService } from "@/app/admin/actions";

export const metadata = { title: "Services" };
const deliveryLabel = { DIRECT: "NTSO", DIRECT_OR_PARTNER: "NTSO / partner", PARTNER: "Partner" } as const;

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("content");
  const sp = await searchParams;
  const pageKey = sp.page && sp.page in SERVICE_PAGES ? sp.page : "network";
  const services = await db.service.findMany({ where: { pageKey }, orderBy: { sortOrder: "asc" } });
  const editing = services.find((s) => s.id === sp.edit);
  return (
    <>
      <AdminHeader title="Services" description="Service listings shown on each service page. Mark partner-delivered services honestly." actions={<Link href={`?page=${pageKey}&edit=new`} className={buttonClass("primary", "sm")}><Plus className="h-4 w-4" aria-hidden="true" /> Add service</Link>} />
      <Flash sp={sp} />
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Service pages">
        {Object.entries(SERVICE_PAGES).map(([k, v]) => (
          <Link key={k} href={`?page=${k}`} aria-current={k === pageKey ? "page" : undefined} className={`rounded-full px-3.5 py-1.5 text-sm ${k === pageKey ? "bg-navy-900 text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>{v}</Link>
        ))}
      </nav>
      {(sp.edit === "new" || editing) && (
        <Card title={editing ? `Edit: ${editing.name}` : "New service"} className="mb-6" actions={<Link href={`?page=${pageKey}`} className="text-sm text-slate-500 hover:underline">Cancel</Link>}>
          <ServiceForm key={editing?.id || "new"} service={editing} pageKey={pageKey} />
        </Card>
      )}
      <Table head={["Order", "Group", "Service", "Delivery", "Status", ""]} empty={!services.length}>
        {services.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-500">{s.sortOrder}</td>
            <td className="px-4 py-3 text-slate-600">{s.group}</td>
            <td className="px-4 py-3"><Link href={`?page=${pageKey}&edit=${s.id}`} className="font-medium text-navy-900 hover:underline">{s.name}</Link><p className="max-w-md truncate text-xs text-slate-500">{s.description}</p></td>
            <td className="px-4 py-3">{deliveryLabel[s.delivery]}</td>
            <td className="px-4 py-3">{s.published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Hidden</Badge>}</td>
            <td className="px-4 py-3 text-right"><form action={deleteService}><input type="hidden" name="id" value={s.id} /><ConfirmButton message={`Delete “${s.name}”?`} className="text-xs text-red-600 hover:underline">Delete</ConfirmButton></form></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
