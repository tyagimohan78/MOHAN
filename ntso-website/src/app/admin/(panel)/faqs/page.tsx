import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Card, Flash, Table } from "@/components/admin/ui";
import { FaqForm } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteFaq } from "@/app/admin/actions";

export const metadata = { title: "FAQs" };

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("content");
  const sp = await searchParams;
  const faqs = await db.faq.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
  const editing = faqs.find((f) => f.id === sp.edit);
  return (
    <>
      <AdminHeader title="FAQs" actions={<Link href="?edit=new" className={buttonClass("primary", "sm")}><Plus className="h-4 w-4" aria-hidden="true" /> Add FAQ</Link>} />
      <Flash sp={sp} />
      {(sp.edit === "new" || editing) && (
        <Card title={editing ? "Edit FAQ" : "New FAQ"} className="mb-6" actions={<Link href="/admin/faqs" className="text-sm text-slate-500 hover:underline">Cancel</Link>}>
          <FaqForm key={editing?.id || "new"} faq={editing} />
        </Card>
      )}
      <Table head={["Category", "Question", "Flags", ""]} empty={!faqs.length}>
        {faqs.map((f) => (
          <tr key={f.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-600">{f.category}</td>
            <td className="px-4 py-3"><Link href={`?edit=${f.id}`} className="font-medium text-navy-900 hover:underline">{f.question}</Link></td>
            <td className="px-4 py-3"><div className="flex gap-1">{f.published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Hidden</Badge>}{f.showOnHome && <Badge tone="cyan">Homepage</Badge>}</div></td>
            <td className="px-4 py-3 text-right"><form action={deleteFaq}><input type="hidden" name="id" value={f.id} /><ConfirmButton message="Delete this FAQ?" className="text-xs text-red-600 hover:underline">Delete</ConfirmButton></form></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
