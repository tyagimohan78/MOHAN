import { randomBytes } from "crypto";

// Crockford-style alphabet without ambiguous characters (0/O, 1/I/L).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

/** e.g. NTSO-Q-261011-7K4MPX */
export function makeReference(prefix: "Q" | "C" | "R" | "S" | "N" | "T", date = new Date()): string {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `NTSO-${prefix}-${y}${m}${d}-${randomCode(6)}`;
}

export function makeAccessKey(): string {
  return randomBytes(18).toString("base64url");
}
