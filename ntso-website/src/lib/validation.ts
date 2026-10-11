import { z } from "zod";
import { contactMethods, licenseDurations, quoteCategories, ticketCategories } from "./site";

// Strip control characters (keeps \n and \t) and trim. Output is always rendered as text by React,
// so HTML is escaped at render time; we additionally never render user input with dangerouslySetInnerHTML.
export const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : v;

const required = (label: string, max: number) =>
  z.preprocess(clean, z.string().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`));
const optional = (max: number) =>
  z.preprocess((v) => {
    const c = clean(v);
    return c === "" || c === null ? undefined : c;
  }, z.string().max(max).optional());

const name = required("Full name", 120).refine((v) => /^[\p{L}\p{M} .'-]{2,}$/u.test(v), "Please enter a valid name");
const email = z.preprocess(
  (v) => (typeof clean(v) === "string" ? (clean(v) as string).toLowerCase() : v),
  z.string().min(1, "Email is required").max(200).email("Please enter a valid email address"),
);
// Indian mobile numbers (+91 optional) or international E.164-ish numbers.
const phonePattern = /^(?:(?:\+|00)?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$|^\+(?:[1-9]\d{0,2})[\s-]?\d{6,12}$/;
const phoneRequired = z.preprocess(clean, z.string().min(1, "Mobile number is required").regex(phonePattern, "Please enter a valid mobile number"));
const phoneOptional = z.preprocess(
  (v) => (clean(v) === "" ? undefined : clean(v)),
  z.string().regex(phonePattern, "Please enter a valid phone number").optional(),
);

export const quoteSchema = z.object({
  fullName: name,
  companyName: required("Company name", 160),
  email,
  phone: phoneRequired,
  city: required("City", 80),
  category: z.enum(quoteCategories, { errorMap: () => ({ message: "Please choose a category" }) }),
  productName: optional(200),
  quantity: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ invalid_type_error: "Quantity must be a number" }).int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(100000).optional(),
  ),
  licenseDuration: z.preprocess((v) => (v === "" ? undefined : v), z.enum(licenseDurations).optional()),
  requirement: required("Requirement", 4000).refine((v) => v.length >= 10, "Please describe your requirement (at least 10 characters)"),
  preferredContact: z.enum(contactMethods, { errorMap: () => ({ message: "Please choose a contact method" }) }),
  sourcePage: optional(200),
  consent: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy to continue" }) }),
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const contactSchema = z.object({
  fullName: name,
  companyName: optional(160),
  email,
  phone: phoneOptional,
  subject: required("Subject", 160),
  message: required("Message", 4000).refine((v) => v.length >= 10, "Please write a little more (at least 10 characters)"),
  consent: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy to continue" }) }),
});

export const renewalSchema = z.object({
  fullName: name,
  companyName: required("Company name", 160),
  email,
  phone: phoneRequired,
  city: optional(80),
  vendor: required("Vendor / product family", 120),
  productName: required("Product or subscription name", 200),
  quantity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number({ invalid_type_error: "Enter a number" }).int().min(1).max(100000).optional(),
  ),
  expiryDate: optional(20).refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date"),
  currentProvider: optional(160),
  requirement: optional(4000),
  consent: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy to continue" }) }),
});

export const surveySchema = z.object({
  surveyType: z.enum(["CCTV site survey", "Network / cabling site survey", "IT infrastructure audit", "Network consultation"]),
  fullName: name,
  companyName: required("Company name", 160),
  email,
  phone: phoneRequired,
  city: required("City", 80),
  siteType: optional(120),
  requirement: required("Requirement", 4000).refine((v) => v.length >= 10, "Please describe the site and requirement"),
  preferredDate: optional(20),
  consent: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy to continue" }) }),
});

export const ticketSchema = z.object({
  customerName: name,
  companyName: required("Company name", 160),
  email,
  phone: phoneOptional,
  category: z.enum(ticketCategories, { errorMap: () => ({ message: "Please choose an issue category" }) }),
  affectedItem: optional(200),
  subject: required("Subject", 160),
  description: required("Issue description", 6000).refine((v) => v.length >= 15, "Please describe the issue (at least 15 characters)"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  consent: z.literal("on", { errorMap: () => ({ message: "Please confirm before submitting" }) }),
});

export const ticketLookupSchema = z.object({
  reference: z.preprocess((v) => (typeof v === "string" ? v.trim().toUpperCase() : v), z.string().regex(/^NTSO-T-\d{6}-[A-Z0-9]{6}$/, "Enter a valid ticket reference, e.g. NTSO-T-261011-ABC234")),
  email,
  accessKey: z.preprocess(clean, z.string().min(10, "Enter the access key from your confirmation").max(64)),
});

export const ticketReplySchema = z.object({
  body: required("Message", 6000),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(200),
});

export const passwordPolicy = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(200)
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), "Use upper- and lower-case letters and a number");

export const slugSchema = z.preprocess(clean, z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"));

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function formToObject(form: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") obj[k] = v;
  return obj;
}

/** Make a URL-safe slug from free text. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
