import "server-only";
import { logger } from "./logger";
import { Prisma, type Enquiry, type EnquiryStatus, type EnquiryType } from "@prisma/client";
import { db } from "./db";
import { makeReference } from "./reference";
import { renderEmail, sendMail } from "./email";
import { config } from "./config";

const PREFIX: Record<EnquiryType, "Q" | "C" | "R" | "S" | "N"> = {
  QUOTE: "Q",
  CONTACT: "C",
  LICENSE_RENEWAL: "R",
  SITE_SURVEY: "S",
  CONSULTATION: "N",
};

export const ENQUIRY_LABEL: Record<EnquiryType, string> = {
  QUOTE: "Quote request",
  CONTACT: "Contact enquiry",
  LICENSE_RENEWAL: "License renewal enquiry",
  SITE_SURVEY: "Site survey request",
  CONSULTATION: "Consultation request",
};

export type NewEnquiry = Omit<Prisma.EnquiryCreateInput, "reference" | "type" | "salesNotification" | "customerNotification">;

/**
 * Persists an enquiry first; notifications are attempted only after the record is saved,
 * and their outcome is recorded so staff can follow up if email delivery failed.
 */
export async function createEnquiry(type: EnquiryType, data: NewEnquiry) {
  let enquiry = null;
  for (let attempt = 0; attempt < 5 && !enquiry; attempt++) {
    try {
      enquiry = await db.enquiry.create({ data: { ...data, type, reference: makeReference(PREFIX[type]) } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue; // reference collision
      throw err;
    }
  }
  if (!enquiry) throw new Error("Could not allocate an enquiry reference");
  await sendEnquiryNotifications(enquiry);
  return enquiry;
}

/**
 * Sends the sales-team and/or customer emails for an enquiry and records the outcome.
 * Used after creation and by the admin "resend" action for failed deliveries.
 */
export async function sendEnquiryNotifications(enquiry: Enquiry, which: { sales?: boolean; customer?: boolean } = { sales: true, customer: true }) {
  const type = enquiry.type;
  const label = ENQUIRY_LABEL[type];
  const details = (enquiry.details as Record<string, string> | null) || {};
  const rows: [string, string | number | null | undefined][] = [
    ["Reference", enquiry.reference],
    ["Type", label],
    ["Name", enquiry.fullName],
    ["Company", enquiry.companyName],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["City", enquiry.city],
    ["Category", enquiry.category],
    ["Product / license", enquiry.productName],
    ["Quantity", enquiry.quantity],
    ["License duration", enquiry.licenseDuration],
    ["Preferred contact", enquiry.preferredContact],
    ...Object.entries(details).map(([k, v]) => [k, String(v)] as [string, string]),
    ["Requirement", enquiry.requirement],
    ["Submitted from", enquiry.sourcePage],
  ];

  const salesMail = renderEmail({
    heading: `New ${label.toLowerCase()} — ${enquiry.reference}`,
    intro: ["A new enquiry was submitted on the NTSO website."],
    rows,
    outro: [`Open in admin: ${config.appUrl}/admin/enquiries/${enquiry.id}`],
  });
  const customerMail = renderEmail({
    heading: `We have received your ${label.toLowerCase()}`,
    intro: [
      `Dear ${enquiry.fullName},`,
      `Thank you for contacting NTSO Private Limited. Your reference number is ${enquiry.reference}. Our team will review your requirement and get in touch using your preferred contact method.`,
    ],
    rows: [
      ["Reference", enquiry.reference],
      ["Category", enquiry.category],
      ["Product / service", enquiry.productName],
      ["Quantity", enquiry.quantity],
    ],
    outro: [
      "Please quote this reference in any follow-up. Do not send passwords, license keys or other secrets by email.",
      "If you did not submit this request, please ignore this email.",
    ],
  });

  const [sales, customer] = await Promise.all([
    which.sales
      ? sendMail({ to: config.salesNotifyEmail, subject: `[${enquiry.reference}] ${label}: ${enquiry.companyName || enquiry.fullName}`, replyTo: enquiry.email, ...salesMail })
      : undefined,
    which.customer ? sendMail({ to: enquiry.email, subject: `NTSO — ${label} received (${enquiry.reference})`, ...customerMail }) : undefined,
  ]);
  await db.enquiry
    .update({ where: { id: enquiry.id }, data: { ...(sales ? { salesNotification: sales } : {}), ...(customer ? { customerNotification: customer } : {}) } })
    .catch((err) => logger.error("enquiry.notification_status_failed", { reference: enquiry.reference }, err));
  return { sales, customer };
}

export const ENQUIRY_TYPES = Object.keys(ENQUIRY_LABEL) as EnquiryType[];
export const ENQUIRY_STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST", "CLOSED"];
const TYPES = ENQUIRY_TYPES;
const STATUSES = ENQUIRY_STATUSES;

export function enquiryWhere(sp: Record<string, string | undefined>): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};
  if (sp.type && TYPES.includes(sp.type as EnquiryType)) where.type = sp.type as EnquiryType;
  if (sp.status && STATUSES.includes(sp.status as EnquiryStatus)) where.status = sp.status as EnquiryStatus;
  if (sp.mail === "FAILED") where.salesNotification = "FAILED";
  const q = sp.q?.trim().slice(0, 100);
  if (q) {
    where.OR = ["reference", "fullName", "companyName", "email", "productName", "city", "phone"].map((f) => ({ [f]: { contains: q, mode: "insensitive" } }));
  }
  return where;
}

