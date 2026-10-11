import { getCurrentUser, can } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getObject } from "@/lib/server/storage";
import { audit } from "@/lib/server/audit";

// Ticket attachments are private: only signed-in staff with ticket permission can download them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "tickets")) return new Response("Forbidden", { status: 403 });
  const { id } = await params;
  const a = await db.ticketAttachment.findUnique({ where: { id } });
  if (!a) return new Response("Not found", { status: 404 });
  const body = await getObject(a.storageKey);
  if (!body) return new Response("File missing", { status: 404 });
  await audit(user.id, "ticket.attachment_downloaded", "TicketAttachment", a.id, { ticketId: a.ticketId });
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": a.mimeType,
      "Content-Disposition": `attachment; filename="${a.fileName.replace(/["\\\r\n]/g, "_")}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
    },
  });
}
