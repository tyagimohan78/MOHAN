"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/server/db";
import { audit } from "@/lib/server/audit";
import { createSession, destroySession, getCurrentUser, hashPassword, requireAction, verifyCredentials } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { notifyCustomerOfUpdate } from "@/lib/server/tickets";
import { sendEnquiryNotifications } from "@/lib/server/enquiries";
import { emailConfigured } from "@/lib/server/config";
import { SETTING_KEYS } from "@/lib/server/settings";
import { IMAGE_MIMES, validateAndStore } from "@/lib/server/storage";
import { ICON_KEYS } from "@/components/ui/icon";
import { clean, formToObject, loginSchema, passwordPolicy, slugify, slugSchema, toFieldErrors } from "@/lib/validation";

export type AdminFormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const str = (max: number) => z.preprocess(clean, z.string().max(max));
const reqStr = (label: string, max: number) => z.preprocess(clean, z.string().min(1, `${label} is required`).max(max));
const optStr = (max: number) => z.preprocess((v) => (clean(v) === "" ? null : clean(v)), z.string().max(max).nullable());
const bool = z.preprocess((v) => v === "on" || v === "true", z.boolean());
const int = z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().int().min(-100000).max(100000));
const id = z.string().cuid();

const back = (path: string, params: Record<string, string>) => `${path}?${new URLSearchParams(params).toString()}`;

/* ---------------- Authentication ---------------- */

export async function loginAction(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const ip = await getClientIp();
  const parsed = loginSchema.safeParse(formToObject(form));
  if (!parsed.success) return { message: "Enter your email and password." };
  const ipLimit = await rateLimit("login-ip", ip, 20, 15 * 60_000);
  const userLimit = await rateLimit("login-user", parsed.data.email, 5, 15 * 60_000);
  if (!ipLimit.ok || !userLimit.ok) return { message: "Too many sign-in attempts. Please wait 15 minutes and try again." };
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    await audit(null, "auth.login_failed", "AdminUser", null, { email: parsed.data.email });
    return { message: "Invalid email or password." };
  }
  await createSession(user.id);
  await audit(user.id, "auth.login", "AdminUser", user.id);
  const next = String(form.get("next") || "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await audit(user.id, "auth.logout", "AdminUser", user.id);
  redirect("/admin/login");
}

export async function changeOwnPassword(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const current = String(form.get("current") || "");
  const next = passwordPolicy.safeParse(form.get("password"));
  if (!next.success) return { errors: { password: next.error.issues[0]!.message } };
  if (form.get("password") !== form.get("confirm")) return { errors: { confirm: "Passwords do not match" } };
  const ok = await verifyCredentials(user.email, current);
  if (!ok) return { errors: { current: "Current password is incorrect" } };
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next.data) } });
  // Invalidate all other sessions; keep the user signed in with a fresh session.
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  await audit(user.id, "user.password_changed", "AdminUser", user.id);
  return { ok: true, message: "Password updated. Other sessions have been signed out." };
}

/* ---------------- Enquiries ---------------- */

const enquiryUpdate = z.object({
  id,
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST", "CLOSED"]),
  assignedToId: z.preprocess((v) => (v === "" ? null : v), id.nullable()),
});

export async function updateEnquiry(form: FormData) {
  const user = await requireAction("enquiries");
  const d = enquiryUpdate.parse(formToObject(form));
  const before = await db.enquiry.findUniqueOrThrow({ where: { id: d.id }, select: { status: true, assignedToId: true } });
  await db.enquiry.update({ where: { id: d.id }, data: { status: d.status, assignedToId: d.assignedToId } });
  await audit(user.id, "enquiry.updated", "Enquiry", d.id, { from: before, to: { status: d.status, assignedToId: d.assignedToId } });
  revalidatePath(`/admin/enquiries/${d.id}`);
  redirect(back(`/admin/enquiries/${d.id}`, { saved: "1" }));
}

export async function addEnquiryNote(form: FormData) {
  const user = await requireAction("enquiries");
  const d = z.object({ id, body: reqStr("Note", 4000) }).parse(formToObject(form));
  await db.enquiryNote.create({ data: { enquiryId: d.id, authorId: user.id, body: d.body } });
  await audit(user.id, "enquiry.note_added", "Enquiry", d.id);
  redirect(back(`/admin/enquiries/${d.id}`, { saved: "1" }));
}

export async function resendEnquiryEmails(form: FormData) {
  const user = await requireAction("enquiries");
  const d = z.object({ id, target: z.enum(["sales", "customer", "both"]) }).parse(formToObject(form));
  const e = await db.enquiry.findUniqueOrThrow({ where: { id: d.id } });
  if (!emailConfigured()) redirect(back(`/admin/enquiries/${d.id}`, { error: "Email delivery is not configured. Set the SMTP_* environment variables first." }));
  const r = await sendEnquiryNotifications(e, { sales: d.target !== "customer", customer: d.target !== "sales" });
  await audit(user.id, "enquiry.notifications_resent", "Enquiry", d.id, r);
  const failed = Object.values(r).includes("FAILED");
  redirect(back(`/admin/enquiries/${d.id}`, failed ? { error: "Email could not be sent. Check SMTP settings and server logs." } : { saved: "1" }));
}

/* ---------------- Tickets ---------------- */

const ticketUpdate = z.object({
  id,
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  assignedToId: z.preprocess((v) => (v === "" ? null : v), id.nullable()),
  notify: bool,
});

export async function updateTicket(form: FormData) {
  const user = await requireAction("tickets");
  const d = ticketUpdate.parse(formToObject(form));
  const before = await db.ticket.findUniqueOrThrow({ where: { id: d.id } });
  let status = d.status;
  if (status === "OPEN" && d.assignedToId && !before.assignedToId) status = "ASSIGNED";
  const t = await db.ticket.update({ where: { id: d.id }, data: { status, priority: d.priority, assignedToId: d.assignedToId } });
  const changes: string[] = [];
  if (before.status !== t.status) changes.push(`Status changed to ${t.status.replace(/_/g, " ").toLowerCase()}.`);
  if (before.priority !== t.priority) changes.push(`Priority set to ${t.priority.toLowerCase()}.`);
  if (changes.length) await db.ticketMessage.create({ data: { ticketId: t.id, authorType: "SYSTEM", body: changes.join(" ") } });
  if (d.notify && before.status !== t.status) await notifyCustomerOfUpdate(t);
  await audit(user.id, "ticket.updated", "Ticket", d.id, { from: { status: before.status, priority: before.priority, assignedToId: before.assignedToId }, to: { status: t.status, priority: t.priority, assignedToId: t.assignedToId } });
  redirect(back(`/admin/tickets/${d.id}`, { saved: "1" }));
}

export async function addTicketMessage(form: FormData) {
  const user = await requireAction("tickets");
  const d = z
    .object({ id, body: reqStr("Message", 6000), internal: bool, setStatus: z.enum(["", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED"]).default("") })
    .parse(formToObject(form));
  const t = await db.ticket.findUniqueOrThrow({ where: { id: d.id } });
  await db.ticketMessage.create({ data: { ticketId: d.id, authorType: "STAFF", authorId: user.id, body: d.body, internal: d.internal } });
  const updated = d.setStatus ? await db.ticket.update({ where: { id: d.id }, data: { status: d.setStatus } }) : await db.ticket.update({ where: { id: d.id }, data: { updatedAt: new Date() } });
  if (!d.internal) await notifyCustomerOfUpdate(updated, d.body);
  await audit(user.id, d.internal ? "ticket.internal_note" : "ticket.replied", "Ticket", d.id, d.setStatus ? { status: d.setStatus } : undefined);
  revalidatePath(`/support/ticket-status/${t.reference}`);
  redirect(back(`/admin/tickets/${d.id}`, { saved: "1" }));
}

/* ---------------- Catalog ---------------- */

const lines = z.preprocess(
  (v) =>
    String(v || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20),
  z.array(z.string().max(300)),
);

const productSchema = z.object({
  id: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
  name: reqStr("Name", 200),
  slug: z.preprocess((v) => (clean(v) === "" ? undefined : v), slugSchema.optional()),
  vendor: optStr(200),
  categoryId: id,
  shortDescription: reqStr("Short description", 300),
  description: reqStr("Description", 6000),
  highlights: lines,
  useCase: optStr(300),
  licenseType: optStr(200),
  subscriptionTerm: optStr(200),
  licensedPer: optStr(200),
  imageAlt: optStr(200),
  removeImage: bool,
  isSample: bool,
  featured: bool,
  published: bool,
  sortOrder: int,
});

export async function saveProduct(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("catalog");
  const parsed = productSchema.safeParse(formToObject(form));
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: pid, removeImage, ...d } = parsed.data;
  const slug = d.slug || slugify(d.name);
  let imageUrl: string | null | undefined = removeImage ? null : undefined;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    const stored = await validateAndStore(file, "products", IMAGE_MIMES);
    if ("error" in stored) return { errors: { image: stored.error } };
    imageUrl = `/media/${stored.key}`;
  }
  const data = { ...d, slug, ...(imageUrl !== undefined ? { imageUrl } : {}) };
  try {
    const saved = pid ? await db.product.update({ where: { id: pid }, data }) : await db.product.create({ data });
    await audit(user.id, pid ? "product.updated" : "product.created", "Product", saved.id, { name: saved.name, published: saved.published });
    revalidatePath("/", "layout");
    redirect(back(`/admin/products/${saved.id}`, { saved: "1" }));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { errors: { slug: "This slug is already used by another product" } };
    throw err;
  }
}

export async function deleteProduct(form: FormData) {
  const user = await requireAction("catalog");
  const pid = id.parse(form.get("id"));
  const p = await db.product.delete({ where: { id: pid } });
  await audit(user.id, "product.deleted", "Product", pid, { name: p.name, slug: p.slug });
  revalidatePath("/", "layout");
  redirect("/admin/products?deleted=1");
}

const categorySchema = z.object({
  id: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
  name: reqStr("Name", 120),
  slug: z.preprocess((v) => (clean(v) === "" ? undefined : v), slugSchema.optional()),
  kind: z.enum(["HARDWARE", "SOFTWARE"]),
  group: reqStr("Group", 120),
  description: reqStr("Description", 600),
  icon: z.string().refine((v) => ICON_KEYS.includes(v), "Choose an icon"),
  sortOrder: int,
  featured: bool,
  published: bool,
});

export async function saveCategory(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("catalog");
  const parsed = categorySchema.safeParse(formToObject(form));
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: cid, ...d } = parsed.data;
  const data = { ...d, slug: d.slug || slugify(d.name) };
  try {
    const saved = cid ? await db.productCategory.update({ where: { id: cid }, data }) : await db.productCategory.create({ data });
    await audit(user.id, cid ? "category.updated" : "category.created", "ProductCategory", saved.id, { name: saved.name });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { errors: { slug: "This slug is already in use" } };
    throw err;
  }
  revalidatePath("/", "layout");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(form: FormData) {
  const user = await requireAction("catalog");
  const cid = id.parse(form.get("id"));
  const count = await db.product.count({ where: { categoryId: cid } });
  if (count > 0) redirect(back("/admin/categories", { error: "Move or delete the products in this category first." }));
  const c = await db.productCategory.delete({ where: { id: cid } });
  await audit(user.id, "category.deleted", "ProductCategory", cid, { name: c.name });
  revalidatePath("/", "layout");
  redirect("/admin/categories?deleted=1");
}

/* ---------------- Services & FAQs (content) ---------------- */

const serviceSchema = z.object({
  id: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
  pageKey: z.enum(["network", "cloud", "cybersecurity", "cctv", "support", "procurement"]),
  group: reqStr("Group", 120),
  name: reqStr("Name", 160),
  description: reqStr("Description", 600),
  delivery: z.enum(["DIRECT", "PARTNER", "DIRECT_OR_PARTNER"]),
  sortOrder: int,
  published: bool,
});

export async function saveService(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("content");
  const parsed = serviceSchema.safeParse(formToObject(form));
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: sid, ...data } = parsed.data;
  const saved = sid ? await db.service.update({ where: { id: sid }, data }) : await db.service.create({ data });
  await audit(user.id, sid ? "service.updated" : "service.created", "Service", saved.id, { name: saved.name });
  revalidatePath("/", "layout");
  redirect(back("/admin/services", { page: data.pageKey, saved: "1" }));
}

export async function deleteService(form: FormData) {
  const user = await requireAction("content");
  const sid = id.parse(form.get("id"));
  const s = await db.service.delete({ where: { id: sid } });
  await audit(user.id, "service.deleted", "Service", sid, { name: s.name });
  revalidatePath("/", "layout");
  redirect(back("/admin/services", { page: s.pageKey, deleted: "1" }));
}

const faqSchema = z.object({
  id: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
  question: reqStr("Question", 300),
  answer: reqStr("Answer", 3000),
  category: reqStr("Category", 80),
  sortOrder: int,
  showOnHome: bool,
  published: bool,
});

export async function saveFaq(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("content");
  const parsed = faqSchema.safeParse(formToObject(form));
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: fid, ...data } = parsed.data;
  const saved = fid ? await db.faq.update({ where: { id: fid }, data }) : await db.faq.create({ data });
  await audit(user.id, fid ? "faq.updated" : "faq.created", "Faq", saved.id);
  revalidatePath("/", "layout");
  redirect("/admin/faqs?saved=1");
}

export async function deleteFaq(form: FormData) {
  const user = await requireAction("content");
  const fid = id.parse(form.get("id"));
  await db.faq.delete({ where: { id: fid } });
  await audit(user.id, "faq.deleted", "Faq", fid);
  revalidatePath("/", "layout");
  redirect("/admin/faqs?deleted=1");
}

/* ---------------- Settings ---------------- */

const httpsUrl = z.preprocess(clean, z.string().max(500).refine((v) => v === "" || /^https:\/\/[^\s"'<>]+$/.test(v), "Must be an https:// URL"));

export async function saveSettings(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("settings");
  const raw = formToObject(form);
  const schema = z.object({
    businessHours: str(200),
    phone: z.preprocess(clean, z.string().max(30).refine((v) => v === "" || /^[+\d][\d\s-]{6,20}$/.test(v), "Enter a valid phone number")),
    whatsapp: z.preprocess(clean, z.string().max(30)),
    address: str(500),
    mapEmbedUrl: z.preprocess(clean, z.string().max(1000).refine((v) => v === "" || /^https:\/\/(www\.)?google\.com\/maps\/embed\?[^\s"'<>]+$/.test(v), "Must be a Google Maps embed URL")),
    linkedinUrl: httpsUrl,
    facebookUrl: httpsUrl,
    xUrl: httpsUrl,
    instagramUrl: httpsUrl,
    youtubeUrl: httpsUrl,
    announcement: str(200),
    supportNote: str(500),
    gstin: z.preprocess(clean, z.string().max(15).refine((v) => v === "" || /^[0-9]{2}[A-Z0-9]{10}[0-9A-Z]{3}$/.test(v), "Enter a valid 15-character GSTIN")),
    cin: z.preprocess(clean, z.string().max(21).refine((v) => v === "" || /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v), "Enter a valid 21-character CIN")),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const entries = Object.entries(parsed.data).filter(([k]) => k in SETTING_KEYS);
  await db.$transaction(entries.map(([key, value]) => db.setting.upsert({ where: { key }, update: { value }, create: { key, value } })));
  await audit(user.id, "settings.updated", "Setting", null, { keys: entries.map(([k]) => k) });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

/* ---------------- Users ---------------- */

export async function saveUser(_prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  const user = await requireAction("users");
  const schema = z.object({
    id: z.preprocess((v) => (v === "" ? undefined : v), id.optional()),
    name: reqStr("Name", 120),
    email: z.preprocess((v) => String(clean(v) || "").toLowerCase(), z.string().email("Enter a valid email")),
    role: z.enum(["ADMIN", "SALES", "SUPPORT", "CONTENT"]),
    active: bool,
    password: z.preprocess((v) => (v === "" ? undefined : v), passwordPolicy.optional()),
  });
  const parsed = schema.safeParse(formToObject(form));
  if (!parsed.success) return { errors: toFieldErrors(parsed.error), message: "Please fix the highlighted fields." };
  const { id: uid, password, ...d } = parsed.data;
  if (!uid && !password) return { errors: { password: "Set an initial password" } };
  if (uid === user.id && (d.role !== "ADMIN" || !d.active)) return { message: "You cannot remove your own admin role or deactivate yourself." };
  try {
    const data = { ...d, ...(password ? { passwordHash: await hashPassword(password) } : {}) };
    const saved = uid ? await db.adminUser.update({ where: { id: uid }, data }) : await db.adminUser.create({ data: { ...data, passwordHash: data.passwordHash! } });
    if (uid && (password || !d.active)) await db.session.deleteMany({ where: { userId: uid } });
    await audit(user.id, uid ? "user.updated" : "user.created", "AdminUser", saved.id, { email: saved.email, role: saved.role, active: saved.active, passwordReset: !!password });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { errors: { email: "A user with this email already exists" } };
    throw err;
  }
  redirect("/admin/users?saved=1");
}
