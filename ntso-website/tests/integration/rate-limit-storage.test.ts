import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/server/rate-limit";
import { db } from "@/lib/server/db";
const run = Date.now().toString(36);
import { ATTACHMENT_MIMES, IMAGE_MIMES, getObject, validateAndStore } from "@/lib/server/storage";

describe("database rate limiter", () => {
  it("allows up to the limit, blocks after, and isolates subjects", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit(`itest-${run}`, "203.0.113.5", 3, 60_000));
    expect(results.map((r) => r.ok)).toEqual([true, true, true, false]);
    expect(results[3]!.retryAfterSec).toBeGreaterThan(0);
    expect((await rateLimit(`itest-${run}`, "203.0.113.6", 3, 60_000)).ok).toBe(true);
    const rows = await db.rateLimit.findMany({ where: { key: { startsWith: `itest-${run}:` } } });
    expect(rows).toHaveLength(2);
    expect(rows.some((r) => r.key.includes("203.0.113"))).toBe(false); // subjects are hashed
  });

  it("starts a new window after expiry", async () => {
    await rateLimit(`itest-window-${run}`, "198.51.100.1", 1, 60_000);
    expect((await rateLimit(`itest-window-${run}`, "198.51.100.1", 1, 60_000)).ok).toBe(false);
    await db.rateLimit.updateMany({ where: { key: { startsWith: `itest-window-${run}:` } }, data: { resetAt: new Date(Date.now() - 1000) } });
    expect((await rateLimit(`itest-window-${run}`, "198.51.100.1", 1, 60_000)).ok).toBe(true);
  });

  it("counts correctly under concurrent requests", async () => {
    const r = await Promise.all(Array.from({ length: 10 }, () => rateLimit(`itest-concurrent-${run}`, "192.0.2.9", 5, 60_000)));
    expect(r.filter((x) => x.ok)).toHaveLength(5);
  });
});

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

describe("file storage validation", () => {
  it("stores a real PNG under a random key and reads it back", async () => {
    const r = await validateAndStore(new File([PNG], "../../etc/passwd.png", { type: "image/png" }), "tickets", ATTACHMENT_MIMES);
    if ("error" in r) throw new Error(r.error);
    expect(r.key).toMatch(/^tickets\/[a-f0-9]{32}\.png$/);
    expect(r.fileName).toBe("passwd.png");
    expect((await getObject(r.key))?.equals(PNG)).toBe(true);
  });
  it("rejects disguised, empty, oversized and disallowed files", async () => {
    const html = await validateAndStore(new File(["<script>alert(1)</script>"], "x.png", { type: "image/png" }), "tickets", ATTACHMENT_MIMES);
    expect("error" in html).toBe(true);
    const empty = await validateAndStore(new File([], "x.png"), "tickets", ATTACHMENT_MIMES);
    expect("error" in empty).toBe(true);
    const big = await validateAndStore(new File([Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)])], "big.png"), "tickets", ATTACHMENT_MIMES);
    expect("error" in big && big.error).toMatch(/5 MB/);
    const pdfAsProductImage = await validateAndStore(new File([Buffer.from("%PDF-1.7\n")], "doc.pdf"), "products", IMAGE_MIMES);
    expect("error" in pdfAsProductImage).toBe(true);
  });
  it("refuses path-traversal storage keys", async () => {
    expect(await getObject("../../.env")).toBeNull();
    expect(await getObject("tickets/../../package.json")).toBeNull();
  });
});
