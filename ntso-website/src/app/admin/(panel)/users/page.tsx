import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Card, Flash, Table } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/forms";
import { Badge } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";
import { requirePage } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Admin users" };

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePage("users");
  const sp = await searchParams;
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true } });
  const editing = users.find((u) => u.id === sp.edit);
  return (
    <>
      <AdminHeader title="Admin users" description="Role-based access for staff. Passwords are stored as bcrypt hashes." actions={<Link href="?edit=new" className={buttonClass("primary", "sm")}><Plus className="h-4 w-4" aria-hidden="true" /> New user</Link>} />
      <Flash sp={sp} />
      {(sp.edit === "new" || editing) && (
        <Card title={editing ? `Edit: ${editing.name}` : "New user"} className="mb-6" actions={<Link href="/admin/users" className="text-sm text-slate-500 hover:underline">Cancel</Link>}>
          <UserForm key={editing?.id || "new"} user={editing} />
        </Card>
      )}
      <Table head={["Name", "Email", "Role", "Status", "Last sign-in"]}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50">
            <td className="px-4 py-3"><Link href={`?edit=${u.id}`} className="font-medium text-navy-900 hover:underline">{u.name}</Link></td>
            <td className="px-4 py-3 text-slate-600">{u.email}</td>
            <td className="px-4 py-3"><Badge tone="navy">{u.role}</Badge></td>
            <td className="px-4 py-3">{u.active ? <Badge tone="green">Active</Badge> : <Badge tone="slate">Disabled</Badge>}</td>
            <td className="px-4 py-3 text-slate-600">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
