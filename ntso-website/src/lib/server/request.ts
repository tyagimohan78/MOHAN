import "server-only";
import { headers } from "next/headers";
import { config } from "./config";

/**
 * Best-effort client IP for rate limiting and audit logs. Proxy headers are trusted unless TRUST_PROXY=false;
 * the reverse proxy in front of the app must overwrite (not append to) X-Real-IP / X-Forwarded-For.
 */
export async function getClientIp(): Promise<string> {
  if (!config.trustProxy) return "unknown";
  const h = await headers();
  const real = h.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim().slice(0, 64);
  return "unknown";
}

export async function getUserAgent(): Promise<string | undefined> {
  return (await headers()).get("user-agent")?.slice(0, 300) || undefined;
}
