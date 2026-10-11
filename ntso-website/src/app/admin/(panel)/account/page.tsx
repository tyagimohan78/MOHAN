import { AdminHeader, Card } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/forms";
import { requirePage } from "@/lib/server/auth";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requirePage();
  return (
    <>
      <AdminHeader title="My account" description={`${user.name} · ${user.email} · ${user.role}`} />
      <Card title="Change password"><PasswordForm /></Card>
    </>
  );
}
