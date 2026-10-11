import Link from "next/link";
import { ExternalLink, FolderTree, HelpCircle, Inbox, LayoutDashboard, LifeBuoy, LogOut, Package, ScrollText, Settings, UserCog, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo";
import { can, type SessionUser, type Permission } from "@/lib/server/auth";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavLink } from "./nav-link";

const nav: { href: string; label: string; icon: ReactNode; perm?: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/enquiries", label: "Enquiries & leads", icon: <Inbox className="h-4 w-4" />, perm: "enquiries" },
  { href: "/admin/tickets", label: "Support tickets", icon: <LifeBuoy className="h-4 w-4" />, perm: "tickets" },
  { href: "/admin/customers", label: "Customers", icon: <Users className="h-4 w-4" />, perm: "customers" },
  { href: "/admin/products", label: "Products & licenses", icon: <Package className="h-4 w-4" />, perm: "catalog" },
  { href: "/admin/categories", label: "Categories", icon: <FolderTree className="h-4 w-4" />, perm: "catalog" },
  { href: "/admin/services", label: "Services", icon: <Wrench className="h-4 w-4" />, perm: "content" },
  { href: "/admin/faqs", label: "FAQs", icon: <HelpCircle className="h-4 w-4" />, perm: "content" },
  { href: "/admin/settings", label: "Website settings", icon: <Settings className="h-4 w-4" />, perm: "settings" },
  { href: "/admin/users", label: "Admin users", icon: <UserCog className="h-4 w-4" />, perm: "users" },
  { href: "/admin/audit-log", label: "Audit log", icon: <ScrollText className="h-4 w-4" />, perm: "audit" },
];

export function AdminShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const items = nav.filter((n) => !n.perm || can(user.role, n.perm));
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-navy-800 bg-navy-950 text-navy-200 lg:relative lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-base font-bold text-white">NTSO Admin</span>
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <button className="flex items-center gap-1.5 text-sm text-navy-300 hover:text-white"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button>
          </form>
        </div>
        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:pb-0">
          <ul className="flex gap-1 lg:flex-col">
            {items.map((n) => (
              <li key={n.href}>
                <AdminNavLink href={n.href} exact={n.href === "/admin"}>
                  {n.icon}
                  {n.label}
                </AdminNavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto hidden border-t border-white/10 p-4 text-sm lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-xs text-navy-400">{user.email} · {user.role}</p>
          <div className="mt-3 flex items-center justify-between">
            <Link href="/admin/account" className="text-xs text-navy-300 hover:text-white">My account</Link>
            <Link href="/" target="_blank" className="flex items-center gap-1 text-xs text-navy-300 hover:text-white">View site <ExternalLink className="h-3 w-3" aria-hidden="true" /></Link>
          </div>
          <form action={logoutAction} className="mt-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-sm hover:bg-white/10"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
