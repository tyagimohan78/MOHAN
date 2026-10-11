import "server-only";
import { headers } from "next/headers";
import { config } from "./config";

/**
 * Best-effort client IP for rate limiting and audit logs. Proxy headers are trusted unless TRUST_PROXY=false;
 * the reverse proxy in front of the app must overwrite (not append to) X-Real-IP / X-Forwarded-For.
 */
export async function getClientIp(): Promise<string> {
  return (await describeClientIp()).ip;
}

/** The detected client IP and which header it came from (shown to admins to verify proxy setup). */
export async function describeClientIp(): Promise<{ ip: string; source: string }> {
  if (!config.trustProxy) return { ip: "unknown", source: "TRUST_PROXY=false" };
  const h = await headers();
  if (config.clientIpHeader) {
    const v = h.get(config.clientIpHeader);
    if (v) return { ip: v.split(",")[0]!.trim().slice(0, 64), source: config.clientIpHeader };
  }
  const real = h.get("x-real-ip");
  if (real) return { ip: real.trim().slice(0, 64), source: "x-real-ip" };
  const fwd = h.get("x-forwarded-for");
  if (fwd) return { ip: fwd.split(",")[0]!.trim().slice(0, 64), source: "x-forwarded-for (first entry)" };
  return { ip: "unknown", source: "no proxy header present" };
}

export async function getUserAgent(): Promise<string | undefined> {
  return (await headers()).get("user-agent")?.slice(0, 300) || undefined;
}
