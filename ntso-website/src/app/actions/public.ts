"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EnquiryType } from "@prisma/client";
import { createEnquiry } from "@/lib/server/enquiries";
import { createTicket, grantTicketCookie, getCustomerTicketFromCookie, verifyTicketAccess } from "@/lib/server/tickets";
import { checkSpam } from "@/lib/server/spam";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { db } from "@/lib/server/db";
import { ATTACHMENT_MIMES, validateAndStore } from "@/lib/server/storage";
import { renderEmail, sendMail } from "@/lib/server/email";
import { config } from "@/lib/server/config";
import {
  contactSchema,
  formToObject,
  quoteSchema,
  renewalSchema,
  surveySchema,
  ticketLookupSchema,
  ticketReplySchema,
  ticketSchema,
  toFieldErrors,
  type FieldErrors,
} from "@/lib/validation";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  reference?: string;
  accessKey?: string;
};

const GENERIC_FAILURE =
  "We could not save your request because of a technical problem. Nothing was submitted — please try again, or email sales@NTSO.in directly.";

function keepValues(form: FormData): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [k, val] of form.entries()) if (typeof val === "string" && !k.startsWith("$") && k !== "accessKey") v[k] = val;
  return v;
}

async function guard(form: FormData, bucket: string, limit = 5): Promise<FormState | null> {
  const ip = await getClientIp();
  const rl = rateLimit(`${bucket}:${ip}`, limit, 10 * 60_000);
  if (!rl.ok) return { ok: false, message: `Too many submissions. Please try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).`, values: keepValues(form) };
  const spam = await checkSpam(form, ip);
  if (spam) return { ok: false, message: spam, values: keepValues(form) };
  return null;
}

export async function submitQuote(_prev: FormState, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "quote");
  if (blocked) return blocked;
  const parsed = quoteSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), message: "Please correct the highlighted fields.", values: keepValues(form) };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- consent is validated, not stored
  const { consent: _consent, ...d } = parsed.data;
  let reference: string;
  try {
    const enquiry = await createEnquiry("QUOTE", d);
    reference = enquiry.reference;
  } catch (err) {
    console.error("[quote] save failed", err);
    return { ok: false, message: GENERIC_FAILURE, values: keepValues(form) };
  }
  redirect(`/request-quote/confirmation?ref=${encodeURIComponent(reference)}`);
}

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "contact");
  if (blocked) return blocked;
  const parsed = contactSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), message: "Please correct the highlighted fields.", values: keepValues(form) };
  const d = parsed.data;
  try {
    const e = await createEnquiry("CONTACT", {
      fullName: d.fullName,
      companyName: d.companyName,
      email: d.email,
      phone: d.phone,
      category: "General enquiry",
      productName: d.subject,
      requirement: d.message,
      sourcePage: "/contact",
    });
    return { ok: true, reference: e.reference, message: "Thank you — your message has been received." };
  } catch (err) {
    console.error("[contact] save failed", err);
    return { ok: false, message: GENERIC_FAILURE, values: keepValues(form) };
  }
}

export async function submitRenewal(_prev: FormState, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "renewal");
  if (blocked) return blocked;
  const parsed = renewalSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), message: "Please correct the highlighted fields.", values: keepValues(form) };
  const d = parsed.data;
  try {
    const e = await createEnquiry("LICENSE_RENEWAL", {
      fullName: d.fullName,
      companyName: d.companyName,
      email: d.email,
      phone: d.phone,
      city: d.city,
      category: `License renewal — ${d.vendor}`,
      productName: d.productName,
      quantity: d.quantity,
      requirement: d.requirement || "License renewal enquiry",
      sourcePage: "/license-renewal",
      details: { "Current expiry date": d.expiryDate || "Not provided", "Current provider": d.currentProvider || "Not provided" },
    });
    return { ok: true, reference: e.reference, message: "Your renewal enquiry has been received." };
  } catch (err) {
    console.error("[renewal] save failed", err);
    return { ok: false, message: GENERIC_FAILURE, values: keepValues(form) };
  }
}

export async function submitSurvey(_prev: FormState, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "survey");
  if (blocked) return blocked;
  const parsed = surveySchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), message: "Please correct the highlighted fields.", values: keepValues(form) };
  const d = parsed.data;
  const type: EnquiryType = d.surveyType === "Network consultation" ? "CONSULTATION" : "SITE_SURVEY";
  try {
    const e = await createEnquiry(type, {
      fullName: d.fullName,
      companyName: d.companyName,
      email: d.email,
      phone: d.phone,
      city: d.city,
      category: d.surveyType,
      requirement: d.requirement,
      sourcePage: String(form.get("sourcePage") || "").slice(0, 200) || undefined,
      details: { "Site type": d.siteType || "Not provided", "Preferred date": d.preferredDate || "Flexible" },
    });
    return { ok: true, reference: e.reference, message: "Your request has been received." };
  } catch (err) {
    console.error("[survey] save failed", err);
    return { ok: false, message: GENERIC_FAILURE, values: keepValues(form) };
  }
}

const MAX_ATTACHMENTS = 3;

export async function submitTicket(_prev: FormState, form: FormData): Promise<FormState> {
  const blocked = await guard(form, "ticket");
  if (blocked) return blocked;
  const parsed = ticketSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), message: "Please correct the highlighted fields.", values: keepValues(form) };

  const files = form.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_ATTACHMENTS) return { ok: false, errors: { attachments: `Attach up to ${MAX_ATTACHMENTS} files.` }, values: keepValues(form) };
  const stored = [];
  for (const f of files) {
    try {
      const r = await validateAndStore(f, "tickets", ATTACHMENT_MIMES);
      if ("error" in r) return { ok: false, errors: { attachments: `${f.name}: ${r.error}` }, values: keepValues(form) };
      stored.push(r);
    } catch (err) {
      console.error("[ticket] attachment storage failed", err);
      return { ok: false, errors: { attachments: "Attachments could not be stored. Remove them and try again." }, values: keepValues(form) };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- consent is validated, not stored
  const { consent: _consent, ...d } = parsed.data;
  try {
    const { ticket, accessKey } = await createTicket({
      ...d,
      attachments: { create: stored.map((s) => ({ fileName: s.fileName, storageKey: s.key, mimeType: s.mime, size: s.size })) },
    });
    await grantTicketCookie(ticket.reference, ticket.email, accessKey);
    return { ok: true, reference: ticket.reference, accessKey, message: "Your support ticket has been created." };
  } catch (err) {
    console.error("[ticket] save failed", err);
    return { ok: false, message: GENERIC_FAILURE.replace("sales@NTSO.in", "sales@NTSO.in with the subject \"Support\""), values: keepValues(form) };
  }
}

export async function lookupTicket(_prev: FormState, form: FormData): Promise<FormState> {
  const ip = await getClientIp();
  const rl = rateLimit(`ticket-lookup:${ip}`, 10, 15 * 60_000);
  if (!rl.ok) return { ok: false, message: "Too many attempts. Please wait a few minutes and try again." };
  const parsed = ticketLookupSchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error), values: keepValues(form) };
  const { reference, email, accessKey } = parsed.data;
  const id = await verifyTicketAccess(reference, email, accessKey);
  if (!id) return { ok: false, message: "We could not find a ticket matching those details.", values: keepValues(form) };
  await grantTicketCookie(reference, email, accessKey);
  redirect(`/support/ticket-status/${reference}`);
}

export async function customerReply(reference: string, _prev: FormState, form: FormData): Promise<FormState> {
  const ip = await getClientIp();
  if (!rateLimit(`ticket-reply:${ip}`, 10, 10 * 60_000).ok) return { ok: false, message: "Too many messages. Please wait a few minutes." };
  const ticketId = await getCustomerTicketFromCookie(reference);
  if (!ticketId) return { ok: false, message: "Your access to this ticket has expired. Please look it up again." };
  const parsed = ticketReplySchema.safeParse(formToObject(form));
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };
  const ticket = await db.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, message: "Ticket not found." };
  if (ticket.status === "CLOSED") return { ok: false, message: "This ticket is closed. Please raise a new ticket if you need further help." };
  await db.$transaction([
    db.ticketMessage.create({ data: { ticketId, authorType: "CUSTOMER", body: parsed.data.body } }),
    db.ticket.update({
      where: { id: ticketId },
      data: { status: ticket.status === "WAITING_FOR_CUSTOMER" || ticket.status === "RESOLVED" ? "IN_PROGRESS" : ticket.status },
    }),
  ]);
  await sendMail({
    to: config.supportNotifyEmail,
    subject: `[${ticket.reference}] Customer replied`,
    replyTo: ticket.email,
    ...renderEmail({ heading: `Customer reply on ${ticket.reference}`, rows: [["From", ticket.customerName], ["Message", parsed.data.body]], outro: [`${config.appUrl}/admin/tickets/${ticket.id}`] }),
  });
  revalidatePath(`/support/ticket-status/${reference}`);
  return { ok: true, message: "Your reply has been added." };
}
