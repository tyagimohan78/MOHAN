/* End-to-end journey tests against a running server.
   Usage: BASE_URL=http://localhost:3000 E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... E2E_SALES_EMAIL=... E2E_SALES_PASSWORD=... node tests/e2e/journeys.mjs
   Requires playwright-core and a Chromium binary (CHROMIUM_PATH). Creates real records — run against dev/staging only. */
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const db = new PrismaClient();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const stamp = Date.now();
const results = [];
// Each run uses its own client IP (the app trusts X-Real-IP from its proxy), so persistent
// database rate limits stay enabled without one run's submissions blocking the next.
const runIp = `10.${(stamp >> 16) & 255}.${(stamp >> 8) & 255}.${stamp & 255}`;
const newContext = (ip = runIp) => browser.newContext({ extraHTTPHeaders: { "x-real-ip": ip } });
const newPage = async (ip) => (await newContext(ip)).newPage();
const run = async (name, fn) => {
  try {
    await fn();
    results.push(["PASS", name]);
    console.log("✔", name);
  } catch (e) {
    results.push(["FAIL", name]);
    console.error("✘", name, "\n  ", e.message.split("\n").slice(0, 4).join("\n   "));
  }
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The per-account login limit (5 / 15 min) is a security control; clear it for the two test accounts
// only, so back-to-back suite runs are deterministic. Mirrors the key format in src/lib/server/rate-limit.ts.
const limitKey = (scope, subject) => `${scope}:${createHash("sha256").update(subject.toLowerCase()).digest("hex").slice(0, 32)}`;
await db.rateLimit.deleteMany({
  where: { key: { in: [process.env.E2E_ADMIN_EMAIL, process.env.E2E_SALES_EMAIL].filter(Boolean).map((e) => limitKey("login-user", e)) } },
});

// A tiny valid PNG for upload tests, plus a fake "PNG" that is really text.
const dir = mkdtempSync(path.join(tmpdir(), "ntso-e2e-"));
const png = path.join(dir, "screenshot.png");
writeFileSync(png, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
const fake = path.join(dir, "evil.png");
writeFileSync(fake, "<script>alert(1)</script>");

await run("Quote form: validation errors shown and nothing saved", async () => {
  const before = await db.enquiry.count();
  const page = await newPage();
  await page.goto(`${BASE}/request-quote`);
  await wait(2700);
  await page.click("button[type=submit]");
  await page.getByText("Please correct the highlighted fields.").waitFor();
  assert.ok(await page.getByText("Full name is required").isVisible());
  await page.waitForFunction(() => document.activeElement?.id === "fullName");
  assert.equal(await page.getAttribute("#fullName", "aria-describedby"), "fullName-error");
  assert.equal(await db.enquiry.count(), before);
  await page.close();
});

await run("Quote form: honeypot submissions are rejected", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/request-quote`);
  await page.evaluate(() => { document.querySelector("input[name=company_website]").value = "http://spam"; });
  await wait(2700);
  await page.click("button[type=submit]");
  await page.getByText("Submission rejected.").waitFor();
  await page.close();
});

let quoteRef;
await run("Quote form: valid submission is saved and shows confirmation with reference", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/request-quote?category=Software%20Licensing&product=Microsoft%20365%20Business%20Premium`);
  assert.equal(await page.inputValue("#productName"), "Microsoft 365 Business Premium");
  await page.fill("#fullName", "Asha Verma");
  await page.fill("#companyName", `Test Industries ${stamp}`);
  await page.fill("#email", `asha.${stamp}@example.com`);
  await page.fill("#phone", "+91 98765 43210");
  await page.fill("#city", "Noida");
  await page.fill("#quantity", "25");
  await page.selectOption("#licenseDuration", "1 year");
  await page.fill("#requirement", "Need 25 licenses for our office with migration help from Google Workspace.");
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/request-quote\/confirmation\?ref=NTSO-Q-/);
  quoteRef = new URL(page.url()).searchParams.get("ref");
  await page.getByText(quoteRef).waitFor();
  const e = await db.enquiry.findUnique({ where: { reference: quoteRef } });
  assert.ok(e, "enquiry saved");
  assert.equal(e.quantity, 25);
  assert.equal(e.category, "Software Licensing");
  assert.ok(["NOT_CONFIGURED", "SENT", "FAILED"].includes(e.salesNotification));
  await page.close();
});

await run("Contact, renewal and site-survey forms save enquiries", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/contact`);
  await page.fill("#fullName", "Ravi Kumar");
  await page.fill("#email", `ravi.${stamp}@example.com`);
  await page.fill("#subject", "Partnership question");
  await page.fill("#message", "Please call me about an office network upgrade.");
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.getByText("we have received your message").waitFor();

  await page.goto(`${BASE}/license-renewal?product=Sophos%20Intercept%20X%20Advanced`);
  await page.fill("#fullName", "Ravi Kumar");
  await page.fill("#companyName", "Ravi Traders");
  await page.fill("#email", `ravi.${stamp}@example.com`);
  await page.fill("#phone", "9876543210");
  await page.selectOption("#vendor", "Sophos");
  await page.fill("#quantity", "40");
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.getByText("Renewal enquiry received").waitFor();

  await page.goto(`${BASE}/it-services/cctv-surveillance#site-survey`);
  await page.fill("#fullName", "Ravi Kumar");
  await page.fill("#companyName", "Ravi Traders");
  await page.fill("#email", `ravi.${stamp}@example.com`);
  await page.fill("#phone", "9876543210");
  await page.fill("#city", "Gurugram");
  await page.fill("#requirement", "Warehouse with 2 docks, need about 16 cameras with 30 days retention.");
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.getByText("Request received").waitFor();
  const n = await db.enquiry.count({ where: { email: `ravi.${stamp}@example.com` } });
  assert.equal(n, 3);
  await page.close();
});

let ticketRef, accessKey;
await run("Ticket: rejects disguised non-image upload", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/support/new-ticket`);
  await page.fill("#customerName", "Neha Singh");
  await page.fill("#companyName", "Singh Logistics");
  await page.fill("#email", `neha.${stamp}@example.com`);
  await page.selectOption("#category", "Printer / Scanner");
  await page.fill("#subject", "Printer offline");
  await page.fill("#description", "The network printer on floor 2 shows offline for all users since morning.");
  await page.setInputFiles("#attachments", fake);
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.getByText("Only PNG, JPG, WebP images or PDF documents are allowed").waitFor();
  await page.close();
});

await run("Ticket: create with attachment, receive reference + access key, view status", async () => {
  const page = await newPage();
  await page.goto(`${BASE}/support/new-ticket`);
  await page.fill("#customerName", "Neha Singh");
  await page.fill("#companyName", "Singh Logistics");
  await page.fill("#email", `neha.${stamp}@example.com`);
  await page.fill("#phone", "9811122233");
  await page.selectOption("#category", "Printer / Scanner");
  await page.fill("#affectedItem", "Floor 2 MFP");
  await page.fill("#subject", "Printer offline");
  await page.fill("#description", "The network printer on floor 2 shows offline for all users since morning.");
  await page.selectOption("#priority", "HIGH");
  await page.setInputFiles("#attachments", png);
  await page.check("input[name=consent]");
  await wait(2600);
  await page.click("button[type=submit]");
  await page.getByText("Your support ticket has been created").waitFor();
  const body = await page.textContent("body");
  ticketRef = body.match(/NTSO-T-\d{6}-[A-Z0-9]{6}/)[0];
  accessKey = (await page.locator("p.font-mono").first().textContent()).trim();
  assert.ok(accessKey.length >= 20);
  const t = await db.ticket.findUnique({ where: { reference: ticketRef }, include: { attachments: true } });
  assert.equal(t.attachments.length, 1);
  assert.notEqual(t.accessKeyHash, accessKey, "access key must be hashed");
  await page.click("text=View ticket status");
  await page.waitForURL(new RegExp(ticketRef));
  await page.getByRole("heading", { name: "Printer offline" }).waitFor();
  await page.fill("textarea[name=body]", "Restarting the printer did not help.");
  await page.click("button:has-text('Send reply')");
  await page.getByText("Your reply has been added.").waitFor();
  await page.getByText("Restarting the printer did not help.").first().waitFor();
  await page.close();
});

await run("Ticket privacy: other visitors cannot view the ticket; wrong key rejected", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/support/ticket-status/${ticketRef}`);
  await page.getByText("Please verify access to this ticket").waitFor();
  assert.ok(!(await page.textContent("body")).includes("Restarting the printer"));
  await page.goto(`${BASE}/support/ticket-status`);
  await page.fill("#reference", ticketRef);
  await page.fill("#email", `neha.${stamp}@example.com`);
  await page.fill("#accessKey", "wrong-key-123456789");
  await page.click("button[type=submit]");
  await page.getByText("We could not find a ticket matching those details.").waitFor();
  await page.fill("#accessKey", accessKey);
  await page.fill("#email", `NEHA.${stamp}@example.com`);
  await page.click("button[type=submit]");
  await page.waitForURL(new RegExp(`/support/ticket-status/${ticketRef}`));
  await page.getByRole("heading", { name: "Printer offline" }).waitFor();
  await ctx.close();
});

await run("Admin: unauthenticated access redirects; protected downloads are 403", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin/tickets`);
  await page.waitForURL(/\/admin\/login\?next=/);
  const att = await db.ticketAttachment.findFirst({ where: { ticket: { reference: ticketRef } } });
  const r = await page.request.get(`${BASE}/admin/attachments/${att.id}`, { maxRedirects: 0 });
  assert.equal(r.status(), 403);
  const r2 = await page.request.get(`${BASE}/admin/enquiries/export`, { maxRedirects: 0 });
  assert.equal(r2.status(), 403);
  // A forged cookie must not grant access
  await ctx.addCookies([{ name: "ntso_admin_session", value: "forged-token", url: BASE }]);
  await page.goto(`${BASE}/admin/enquiries`);
  await page.waitForURL(/\/admin\/login/);
  await ctx.close();
});

await run("Admin: wrong password rejected, correct login reaches dashboard", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", process.env.E2E_ADMIN_EMAIL);
  await page.fill("#password", "not-the-password");
  await page.click("button[type=submit]");
  await page.getByText("Invalid email or password.").waitFor();
  await page.fill("#password", process.env.E2E_ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`);
  await page.getByText("Latest enquiries").waitFor();

  // Update the quote enquiry
  const e = await db.enquiry.findUnique({ where: { reference: quoteRef } });
  await page.goto(`${BASE}/admin/enquiries/${e.id}`);
  await page.selectOption("#status", "CONTACTED");
  await page.click("form:has(#status) button[type=submit]");
  await page.getByText("Changes saved.").waitFor();
  assert.equal((await db.enquiry.findUnique({ where: { id: e.id } })).status, "CONTACTED");

  // Reply to ticket publicly + internal note
  const t = await db.ticket.findUnique({ where: { reference: ticketRef } });
  await page.goto(`${BASE}/admin/tickets/${t.id}`);
  await page.fill("#body", "Please confirm the printer IP shown on its display.");
  await page.selectOption("select[name=setStatus]", "WAITING_FOR_CUSTOMER");
  await page.click("button:has-text('Post')");
  await page.getByText("Changes saved.").waitFor();
  await page.fill("#body", "INTERNAL: likely DHCP lease issue");
  await page.check("input[name=internal]");
  await page.click("button:has-text('Post')");
  await page.getByText("Changes saved.").waitFor();
  const att = await db.ticketAttachment.findFirst({ where: { ticketId: t.id } });
  const dl = await page.request.get(`${BASE}/admin/attachments/${att.id}`);
  assert.equal(dl.status(), 200);
  assert.equal(dl.headers()["content-type"], "image/png");
  const csv = await page.request.get(`${BASE}/admin/enquiries/export`);
  assert.equal(csv.status(), 200);
  assert.ok((await csv.text()).includes(quoteRef));
  assert.equal((await db.ticket.findUnique({ where: { id: t.id } })).status, "WAITING_FOR_CUSTOMER");
  const logs = await db.auditLog.count({ where: { entityId: t.id } });
  assert.ok(logs >= 2, "audit log written");
  await ctx.close();
});

await run("Customer sees staff reply but not internal note", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/support/ticket-status`);
  await page.fill("#reference", ticketRef);
  await page.fill("#email", `neha.${stamp}@example.com`);
  await page.fill("#accessKey", accessKey);
  await page.click("button[type=submit]");
  await page.waitForURL(new RegExp(ticketRef));
  await page.getByText("Please confirm the printer IP").waitFor();
  assert.ok(!(await page.textContent("body")).includes("INTERNAL: likely DHCP"));
  await page.getByText("Waiting for Customer").first().waitFor();
  await ctx.close();
});

await run("Admin RBAC: SALES role cannot access tickets or settings", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", process.env.E2E_SALES_EMAIL);
  await page.fill("#password", process.env.E2E_SALES_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`);
  await page.goto(`${BASE}/admin/tickets`);
  await page.waitForURL(/\/admin\?denied=1/);
  await page.goto(`${BASE}/admin/settings`);
  await page.waitForURL(/\/admin\?denied=1/);
  const att = await db.ticketAttachment.findFirst({ where: { ticket: { reference: ticketRef } } });
  assert.equal((await page.request.get(`${BASE}/admin/attachments/${att.id}`)).status(), 403);
  await page.goto(`${BASE}/admin/enquiries`);
  await page.getByText(quoteRef).waitFor();
  await ctx.close();
});


await run("Admin catalogue & settings: validation keeps edits; changes appear on public site", async () => {
  const ctx = await newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", process.env.E2E_ADMIN_EMAIL);
  await page.fill("#password", process.env.E2E_ADMIN_PASSWORD);
  await page.click("button[type=submit]");
  await page.waitForURL(`${BASE}/admin`);
  await page.goto(`${BASE}/admin/products/new`);
  const name = `E2E Test Switch ${stamp}`;
  await page.fill("#name", name);
  await page.selectOption("#categoryId", { label: "Networking Products — PoE Switches" });
  await page.fill("#shortDescription", "Test listing");
  await page.fill("#slug", "Invalid Slug!");
  await page.fill("#description", "Created by the e2e suite.");
  await page.click("button:has-text('Create product')");
  await page.getByText("Use lowercase letters, numbers and hyphens").waitFor();
  assert.equal(await page.inputValue("#name"), name, "edits preserved after validation error");
  await page.fill("#slug", `e2e-test-switch-${stamp}`);
  await page.click("button:has-text('Create product')");
  await page.getByText("Changes saved.").waitFor();
  const pub = await ctx.newPage();
  await pub.goto(`${BASE}/products/poe-switches`);
  await pub.getByText(name).waitFor();
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#businessHours", "Mon–Sat, 10:00–18:30 IST");
  await page.fill("#linkedinUrl", "http://not-https.example");
  await page.click("button:has-text('Save settings')");
  await page.getByText("Must be an https:// URL").waitFor();
  assert.equal(await page.inputValue("#businessHours"), "Mon–Sat, 10:00–18:30 IST");
  await page.fill("#linkedinUrl", "");
  await page.click("button:has-text('Save settings')");
  await page.getByText("Settings saved.").waitFor();
  await pub.goto(`${BASE}/contact`);
  await pub.getByText("Mon–Sat, 10:00–18:30 IST").first().waitFor();
  // clean up
  await db.product.deleteMany({ where: { slug: `e2e-test-switch-${stamp}` } });
  await db.setting.deleteMany({ where: { key: "businessHours" } });
  await ctx.close();
});

await run("Rate limiting: repeated ticket look-ups are throttled", async () => {
  const page = await newPage(`10.250.${stamp & 255}.${(stamp >> 8) & 255}`);
  await page.goto(`${BASE}/support/ticket-status`);
  let throttled = false;
  for (let i = 0; i < 12 && !throttled; i++) {
    await page.fill("#reference", "NTSO-T-261011-ZZZZZZ");
    await page.fill("#email", "nobody@example.com");
    await page.fill("#accessKey", `wrong-key-${i}-000000`);
    await Promise.all([page.waitForResponse((r) => r.request().method() === "POST"), page.click("button[type=submit]")]);
    await page.locator("[role=alert]").first().waitFor();
    throttled = (await page.textContent("body")).includes("Too many attempts");
  }
  assert.ok(throttled, "11th look-up within 15 minutes should be throttled");
  const rows = await db.rateLimit.count({ where: { key: { startsWith: "ticket-lookup:" } } });
  assert.ok(rows >= 1, "counter stored in database");
  await page.close();
});

await run("Rate limiting: repeated failed logins for one account are throttled", async () => {
  const page = await newPage(`10.251.${stamp & 255}.${(stamp >> 8) & 255}`);
  await page.goto(`${BASE}/admin/login`);
  const victim = `nobody-${stamp}@ntso.test`;
  let msg = "";
  for (let i = 0; i < 6; i++) {
    await page.fill("#email", victim);
    await page.fill("#password", `guess-${i}`);
    await Promise.all([page.waitForResponse((r) => r.request().method() === "POST"), page.click("button[type=submit]")]);
    await page.locator("[role=alert]").first().waitFor();
    msg = await page.locator("[role=alert]").first().textContent();
  }
  assert.match(msg, /Too many sign-in attempts/);
  const failed = await db.auditLog.count({ where: { action: "auth.login_failed", details: { path: ["email"], equals: victim } } });
  assert.equal(failed, 5, "the five evaluated failures are audit-logged; the throttled attempt never checks the password");
  await page.close();
});

await run("Health endpoint reports database status", async () => {
  const page = await newPage();
  const r = await page.request.get(`${BASE}/api/health`);
  assert.equal(r.status(), 200);
  assert.deepEqual((await r.json()).database, "ok");
  await page.close();
});

await run("Security headers present", async () => {
  const page = await newPage();
  const res = await page.goto(`${BASE}/`);
  const h = res.headers();
  assert.ok(h["content-security-policy"]?.includes("frame-ancestors 'none'"));
  assert.equal(h["x-content-type-options"], "nosniff");
  assert.equal(h["x-frame-options"], "DENY");
  assert.ok(!h["x-powered-by"]);
  await page.close();
});

await browser.close();
await db.$disconnect();
const failed = results.filter(([s]) => s === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} journeys passed`);
process.exit(failed ? 1 : 0);
