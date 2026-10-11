import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Card, Flash, Table } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/form-bits";
import { Badge } from "@/components/ui/notice";
import { Icon, ICON_KEYS } from "@/components/ui/icon";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { deleteCategory } from "@/app/admin/actions";

export const metadata = { title: "Categories" };

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("catalog");
  const sp = await searchParams;
  const cats = await db.productCategory.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }], include: { _count: { select: { products: true } } } });
  const editing = sp.edit === "new" ? null : cats.find((c) => c.id === sp.edit);
  return (
    <>
      <AdminHeader title="Product categories" description="Hardware categories appear on /products; software categories on /software-licensing." actions={<Link href="?edit=new" className={buttonClass("primary", "sm")}><Plus className="h-4 w-4" aria-hidden="true" /> New category</Link>} />
      <Flash sp={sp} />
      {(sp.edit === "new" || editing) && (
        <Card title={editing ? `Edit: ${editing.name}` : "New category"} className="mb-6" actions={<Link href="/admin/categories" className="text-sm text-slate-500 hover:underline">Cancel</Link>}>
          <CategoryForm key={editing?.id || "new"} category={editing || undefined} icons={ICON_KEYS} />
        </Card>
      )}
      <Table head={["", "Name", "Type / group", "Products", "Status", ""]}>
        {cats.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50">
            <td className="px-4 py-3"><Icon name={c.icon} className="h-5 w-5 text-navy-600" /></td>
            <td className="px-4 py-3"><Link href={`?edit=${c.id}`} className="font-medium text-navy-900 hover:underline">{c.name}</Link><p className="font-mono text-xs text-slate-500">{c.slug}</p></td>
            <td className="px-4 py-3 text-slate-600">{c.kind === "SOFTWARE" ? "Software" : "Hardware"} · {c.group}</td>
            <td className="px-4 py-3">{c._count.products}</td>
            <td className="px-4 py-3">{c.published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Hidden</Badge>}</td>
            <td className="px-4 py-3 text-right">
              {c._count.products === 0 && (
                <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton message={`Delete category “${c.name}”?`} className="text-xs text-red-600 hover:underline">Delete</ConfirmButton></form>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
