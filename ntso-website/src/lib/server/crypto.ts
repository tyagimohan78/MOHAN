import { createHash, timingSafeEqual } from "crypto";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
