import "server-only";
import { db } from "./db";
import { sha256 } from "./crypto";
import { logger } from "./logger";

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

/*
 * Fixed-window rate limiter.
 * Default store is PostgreSQL (one atomic upsert per check), so limits hold across multiple
 * app instances. RATE_LIMIT_STORE=memory switches to a per-process store (tests / single instance).
 * If the database is unreachable the limiter falls back to memory instead of blocking customers.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function memoryRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  return { ok: true, retryAfterSec: 0 };
}

async function databaseRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowMs);
  const rows = await db.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" <= now() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= now() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const row = rows[0]!;
  if (row.count > limit) return { ok: false, retryAfterSec: Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)) };
  return { ok: true, retryAfterSec: 0 };
}

/** `scope` names the limit (e.g. "quote"), `subject` is the IP/email it applies to (hashed before storage). */
export async function rateLimit(scope: string, subject: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_DISABLED === "true" && process.env.NODE_ENV !== "production") return { ok: true, retryAfterSec: 0 };
  const key = `${scope}:${sha256(subject.toLowerCase()).slice(0, 32)}`;
  if (process.env.RATE_LIMIT_STORE === "memory") return memoryRateLimit(key, limit, windowMs);
  try {
    return await databaseRateLimit(key, limit, windowMs);
  } catch (err) {
    logger.error("rate-limit.db_unavailable", { scope }, err);
    return memoryRateLimit(key, limit, windowMs);
  }
}

export function resetMemoryRateLimits() {
  buckets.clear();
}
