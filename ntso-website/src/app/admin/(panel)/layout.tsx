import { AdminShell } from "@/components/admin/shell";
import { requirePage } from "@/lib/server/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  return <AdminShell user={user}>{children}</AdminShell>;
}
