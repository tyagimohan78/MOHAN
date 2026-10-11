import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { createTicket, verifyTicketAccess } from "@/lib/server/tickets";
import { verifyCredentials, can } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { sha256 } from "@/lib/server/crypto";

describe("support tickets", () => {
  it("creates a ticket with a hashed access key and a system message", async () => {
    const { ticket, accessKey } = await createTicket({
      customerName: "Neha Singh",
      companyName: "Singh Logistics",
      email: "Neha@Example.com",
      category: "Network / Wi-Fi",
      subject: "Wi-Fi drops",
      description: "Wi-Fi drops every hour in the warehouse.",
      priority: "HIGH",
    });
    expect(ticket.reference).toMatch(/^NTSO-T-\d{6}-[A-Z0-9]{6}$/);
    expect(accessKey.length).toBeGreaterThanOrEqual(24);
    const row = await db.ticket.findUniqueOrThrow({ where: { id: ticket.id }, include: { messages: true } });
    expect(row.accessKeyHash).toBe(sha256(accessKey));
    expect(row.accessKeyHash).not.toContain(accessKey);
    expect(row.status).toBe("OPEN");
    expect(row.messages).toHaveLength(1);

    expect(await verifyTicketAccess(ticket.reference, "neha@example.com", accessKey)).toBe(ticket.id);
    expect(await verifyTicketAccess(ticket.reference, "other@example.com", accessKey)).toBeNull();
    expect(await verifyTicketAccess(ticket.reference, "neha@example.com", accessKey + "x")).toBeNull();
    expect(await verifyTicketAccess("NTSO-T-000000-AAAAAA", "neha@example.com", accessKey)).toBeNull();
  });
});

const run = Date.now().toString(36);

describe("admin authentication & authorisation", () => {
  it("accepts valid credentials, rejects wrong passwords and inactive users", async () => {
    const passwordHash = await bcrypt.hash("Correct-Horse-9", 4);
    await db.adminUser.create({ data: { email: `active-${run}@ntso.test`, name: "Active", role: "SALES", passwordHash } });
    await db.adminUser.create({ data: { email: `inactive-${run}@ntso.test`, name: "Inactive", role: "ADMIN", passwordHash, active: false } });
    expect((await verifyCredentials(`ACTIVE-${run}@ntso.test`, "Correct-Horse-9"))?.email).toBe(`active-${run}@ntso.test`);
    expect(await verifyCredentials(`active-${run}@ntso.test`, "wrong")).toBeNull();
    expect(await verifyCredentials(`inactive-${run}@ntso.test`, "Correct-Horse-9")).toBeNull();
    expect(await verifyCredentials("nobody@ntso.test", "Correct-Horse-9")).toBeNull();
  });

  it("enforces the role permission matrix", () => {
    expect(can("ADMIN", "users")).toBe(true);
    expect(can("SALES", "enquiries")).toBe(true);
    expect(can("SALES", "tickets")).toBe(false);
    expect(can("SALES", "settings")).toBe(false);
    expect(can("SUPPORT", "tickets")).toBe(true);
    expect(can("SUPPORT", "enquiries")).toBe(false);
    expect(can("CONTENT", "catalog")).toBe(true);
    expect(can("CONTENT", "customers")).toBe(false);
    expect(can("CONTENT", "audit")).toBe(false);
  });
});
