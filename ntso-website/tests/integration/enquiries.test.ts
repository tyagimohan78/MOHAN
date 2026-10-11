import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { startSmtpSink } from "./helpers";

const base = {
  fullName: "Asha Verma",
  companyName: "Integration Test Pvt Ltd",
  email: "asha@example.com",
  phone: "9876543210",
  city: "Noida",
  category: "Software Licensing",
  productName: "Microsoft 365 Business Premium",
  quantity: 25,
  requirement: "Need licenses <script>alert(1)</script> for 25 users",
  preferredContact: "Email",
};

describe("enquiries without SMTP configured", () => {
  it("saves the enquiry with a unique reference and records NOT_CONFIGURED", async () => {
    const { createEnquiry } = await import("@/lib/server/enquiries");
    const { db } = await import("@/lib/server/db");
    const a = await createEnquiry("QUOTE", base);
    const b = await createEnquiry("LICENSE_RENEWAL", { ...base, details: { "Current expiry date": "2026-12-31" } });
    expect(a.reference).toMatch(/^NTSO-Q-\d{6}-[A-Z0-9]{6}$/);
    expect(b.reference).toMatch(/^NTSO-R-/);
    const saved = await db.enquiry.findUniqueOrThrow({ where: { id: a.id } });
    expect(saved.status).toBe("NEW");
    expect(saved.quantity).toBe(25);
    expect(saved.salesNotification).toBe("NOT_CONFIGURED");
    expect(saved.customerNotification).toBe("NOT_CONFIGURED");
  });
});

describe("enquiries with SMTP configured", () => {
  let sink: Awaited<ReturnType<typeof startSmtpSink>>;
  beforeAll(async () => {
    sink = await startSmtpSink();
  });
  afterAll(async () => {
    await sink.close();
    vi.unstubAllEnvs();
  });

  it("emails the sales team and the customer, escaping user input", async () => {
    vi.resetModules();
    vi.stubEnv("SMTP_HOST", "127.0.0.1");
    vi.stubEnv("SMTP_PORT", String(sink.port));
    vi.stubEnv("SMTP_USER", "test");
    vi.stubEnv("SMTP_PASSWORD", "test");
    vi.stubEnv("SALES_NOTIFY_EMAIL", "sales@ntso.test");
    const { createEnquiry } = await import("@/lib/server/enquiries");
    const { db } = await import("@/lib/server/db");
    const e = await createEnquiry("QUOTE", { ...base, email: "buyer@example.com" });
    const saved = await db.enquiry.findUniqueOrThrow({ where: { id: e.id } });
    expect(saved.salesNotification).toBe("SENT");
    expect(saved.customerNotification).toBe("SENT");
    const toSales = sink.messages.find((m) => m.subject?.includes(e.reference) && m.subject.startsWith("["));
    const toCustomer = sink.messages.find((m) => m.subject === `NTSO — Quote request received (${e.reference})`);
    expect(toSales?.replyTo?.text).toContain("buyer@example.com");
    expect(toCustomer?.to && "text" in toCustomer.to ? toCustomer.to.text : "").toContain("buyer@example.com");
    expect(toSales?.html).toContain("&lt;script&gt;");
    expect(toSales?.html).not.toContain("<script>alert");
  });

  it("records FAILED when the SMTP server is unreachable, and a resend succeeds later", async () => {
    vi.resetModules();
    vi.stubEnv("SMTP_HOST", "127.0.0.1");
    vi.stubEnv("SMTP_PORT", "1"); // nothing listens here
    const failing = await import("@/lib/server/enquiries");
    const { db } = await import("@/lib/server/db");
    const e = await failing.createEnquiry("CONTACT", base);
    expect((await db.enquiry.findUniqueOrThrow({ where: { id: e.id } })).salesNotification).toBe("FAILED");

    vi.resetModules();
    vi.stubEnv("SMTP_PORT", String(sink.port));
    const working = await import("@/lib/server/enquiries");
    const r = await working.sendEnquiryNotifications(await db.enquiry.findUniqueOrThrow({ where: { id: e.id } }), { sales: true });
    expect(r.sales).toBe("SENT");
    expect(r.customer).toBeUndefined();
    const after = await db.enquiry.findUniqueOrThrow({ where: { id: e.id } });
    expect(after.salesNotification).toBe("SENT");
    expect(after.customerNotification).toBe("FAILED");
  });
});
