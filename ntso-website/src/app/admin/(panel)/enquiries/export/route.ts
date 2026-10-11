import { getCurrentUser, can } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { audit } from "@/lib/server/audit";
import { enquiryWhere } from "@/lib/server/enquiries";

// CSV export of enquiries for authorised sales staff. Cells are escaped and guarded against spreadsheet formula injection.
const cell = (v: unknown) => {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "enquiries")) return new Response("Forbidden", { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await db.enquiry.findMany({ where: enquiryWhere(sp), orderBy: { createdAt: "desc" }, take: 5000 });
  const cols = ["reference", "createdAt", "type", "status", "fullName", "companyName", "email", "phone", "city", "category", "productName", "quantity", "licenseDuration", "preferredContact", "requirement", "sourcePage"] as const;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
  await audit(user.id, "enquiry.exported", "Enquiry", null, { count: rows.length });
  return new Response("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ntso-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
