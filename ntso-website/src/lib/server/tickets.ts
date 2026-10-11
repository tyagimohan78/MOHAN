import "server-only";
import { Prisma, type Ticket, type TicketStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { db } from "./db";
import { makeAccessKey, makeReference } from "./reference";
import { safeEqualHex, sha256 } from "./crypto";
import { renderEmail, sendMail } from "./email";
import { config } from "./config";

export const TICKET_ACCESS_COOKIE = "ntso_ticket_access";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_CUSTOMER: "Waiting for Customer",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export async function createTicket(data: Omit<Prisma.TicketCreateInput, "reference" | "accessKeyHash">) {
  const accessKey = makeAccessKey();
  let ticket: Ticket | null = null;
  for (let attempt = 0; attempt < 5 && !ticket; attempt++) {
    try {
      ticket = await db.ticket.create({
        data: {
          ...data,
          reference: makeReference("T"),
          accessKeyHash: sha256(accessKey),
          messages: { create: { authorType: "SYSTEM", body: "Ticket created via the NTSO Support Center." } },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
      throw err;
    }
  }
  if (!ticket) throw new Error("Could not allocate a ticket reference");

  const statusUrl = `${config.appUrl}/support/ticket-status`;
  await Promise.all([
    sendMail({
      to: config.supportNotifyEmail,
      subject: `[${ticket.reference}] New ${ticket.priority} ticket: ${ticket.subject}`,
      replyTo: ticket.email,
      ...renderEmail({
        heading: `New support ticket ${ticket.reference}`,
        rows: [
          ["Customer", ticket.customerName],
          ["Company", ticket.companyName],
          ["Email", ticket.email],
          ["Phone", ticket.phone],
          ["Category", ticket.category],
          ["Affected device / service", ticket.affectedItem],
          ["Priority (customer-selected)", ticket.priority],
          ["Subject", ticket.subject],
          ["Description", ticket.description],
        ],
        outro: [`Open in admin: ${config.appUrl}/admin/tickets/${ticket.id}`],
      }),
    }),
    sendMail({
      to: ticket.email,
      subject: `NTSO Support — ticket ${ticket.reference} received`,
      ...renderEmail({
        heading: "Your support ticket has been received",
        intro: [`Dear ${ticket.customerName},`, "Our support team will review your ticket and respond. You can check its status and reply online."],
        rows: [
          ["Ticket reference", ticket.reference],
          ["Access key", accessKey],
          ["Subject", ticket.subject],
          ["Check status", statusUrl],
        ],
        outro: ["Keep the access key private — together with your email address it gives access to this ticket. NTSO staff will never ask for your passwords."],
      }),
    }),
  ]);

  return { ticket, accessKey };
}

/** Verify reference + email + access key. Returns the ticket id when valid. */
export async function verifyTicketAccess(reference: string, email: string, accessKey: string): Promise<string | null> {
  const ticket = await db.ticket.findUnique({ where: { reference }, select: { id: true, email: true, accessKeyHash: true } });
  const candidate = sha256(accessKey);
  // Compare even when not found to reduce timing differences.
  const hashOk = safeEqualHex(candidate, ticket?.accessKeyHash ?? sha256("no-ticket"));
  if (!ticket || !hashOk || ticket.email.toLowerCase() !== email.toLowerCase()) return null;
  return ticket.id;
}

/** Reads the customer's ticket-access cookie and re-verifies it on every request. */
export async function getCustomerTicketFromCookie(reference: string) {
  const raw = (await cookies()).get(TICKET_ACCESS_COOKIE)?.value;
  if (!raw) return null;
  try {
    const grants = JSON.parse(Buffer.from(raw, "base64url").toString()) as { r: string; e: string; k: string }[];
    const grant = grants.find((g) => g.r === reference);
    if (!grant) return null;
    const id = await verifyTicketAccess(grant.r, grant.e, grant.k);
    return id;
  } catch {
    return null;
  }
}

export async function grantTicketCookie(reference: string, email: string, accessKey: string) {
  const jar = await cookies();
  let grants: { r: string; e: string; k: string }[] = [];
  try {
    const raw = jar.get(TICKET_ACCESS_COOKIE)?.value;
    if (raw) grants = JSON.parse(Buffer.from(raw, "base64url").toString());
  } catch {
    grants = [];
  }
  grants = [{ r: reference, e: email, k: accessKey }, ...grants.filter((g) => g.r !== reference)].slice(0, 5);
  jar.set(TICKET_ACCESS_COOKIE, Buffer.from(JSON.stringify(grants)).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/support",
    maxAge: 60 * 60 * 4,
  });
}

export async function notifyCustomerOfUpdate(ticket: Pick<Ticket, "reference" | "email" | "customerName" | "status">, message?: string) {
  return sendMail({
    to: ticket.email,
    subject: `NTSO Support — update on ticket ${ticket.reference}`,
    ...renderEmail({
      heading: `Update on ticket ${ticket.reference}`,
      intro: [`Dear ${ticket.customerName},`, "There is an update on your support ticket."],
      rows: [
        ["Status", STATUS_LABEL[ticket.status]],
        ["Message from support", message],
      ],
      outro: [`View the ticket and reply: ${config.appUrl}/support/ticket-status (you will need your reference, email and access key).`],
    }),
  });
}
