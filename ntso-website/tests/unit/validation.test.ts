import { describe, expect, it } from "vitest";
import { quoteSchema, ticketLookupSchema, slugify, passwordPolicy, clean } from "@/lib/validation";
import { makeReference, randomCode } from "@/lib/server/reference";
import { sha256, safeEqualHex } from "@/lib/server/crypto";

const valid = {
  fullName: "Asha Verma",
  companyName: "Acme Pvt Ltd",
  email: "Asha@Example.com",
  phone: "+91 98765 43210",
  city: "Noida",
  category: "Software Licensing",
  productName: "",
  quantity: "10",
  licenseDuration: "1 year",
  requirement: "Need ten licenses for staff.",
  preferredContact: "Email",
  consent: "on",
};

describe("quoteSchema", () => {
  it("accepts a valid quote and normalises values", () => {
    const r = quoteSchema.parse(valid);
    expect(r.email).toBe("asha@example.com");
    expect(r.quantity).toBe(10);
    expect(r.productName).toBeUndefined();
  });
  it("rejects invalid phone, category and missing consent", () => {
    const r = quoteSchema.safeParse({ ...valid, phone: "12345", category: "Hacking", consent: undefined });
    expect(r.success).toBe(false);
    const keys = r.success ? [] : r.error.issues.map((i) => i.path[0]);
    expect(keys).toEqual(expect.arrayContaining(["phone", "category", "consent"]));
  });
  it("rejects non-integer and negative quantities", () => {
    expect(quoteSchema.safeParse({ ...valid, quantity: "2.5" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, quantity: "-1" }).success).toBe(false);
  });
  it("strips control characters", () => {
    expect(clean("  hi\u0000there\n ")).toBe("hithere");
  });
});

describe("ticket lookup", () => {
  it("normalises the reference format", () => {
    const r = ticketLookupSchema.parse({ reference: " ntso-t-261011-abc234 ", email: "a@b.co", accessKey: "abcdefghijkl" });
    expect(r.reference).toBe("NTSO-T-261011-ABC234");
  });
});

describe("helpers", () => {
  it("generates references with the expected shape", () => {
    expect(makeReference("Q", new Date("2026-10-11T10:00:00Z"))).toMatch(/^NTSO-Q-261011-[2-9A-HJ-NP-Z]{6}$/);
    expect(new Set(Array.from({ length: 200 }, () => randomCode(6))).size).toBeGreaterThan(195);
  });
  it("slugifies text", () => {
    expect(slugify("Wi-Fi 6E Access Point (Indoor) — Pro")).toBe("wi-fi-6e-access-point-indoor-pro");
  });
  it("enforces the password policy", () => {
    expect(passwordPolicy.safeParse("short").success).toBe(false);
    expect(passwordPolicy.safeParse("alllowercase12345").success).toBe(false);
    expect(passwordPolicy.safeParse("Valid-Passw0rd-123").success).toBe(true);
  });
  it("compares hashes in constant time", () => {
    expect(safeEqualHex(sha256("a"), sha256("a"))).toBe(true);
    expect(safeEqualHex(sha256("a"), sha256("b"))).toBe(false);
  });
});
