/* Routine maintenance — schedule daily (cron, platform scheduler or `docker compose run`).
   Usage: npm run maintenance
   - deletes expired admin sessions and expired rate-limit counters (always)
   - deletes audit-log entries older than AUDIT_LOG_RETENTION_DAYS (only if set)
   Customer data (enquiries, tickets) is never deleted automatically: retention is a business/legal decision. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const now = new Date();
  const sessions = await db.session.deleteMany({ where: { expiresAt: { lt: now } } });
  const limits = await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });
  let audit = 0;
  const days = Number(process.env.AUDIT_LOG_RETENTION_DAYS || 0);
  if (Number.isFinite(days) && days >= 30) {
    audit = (await db.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - days * 86_400_000) } } })).count;
  }
  console.log(JSON.stringify({ event: "maintenance.done", expiredSessions: sessions.count, expiredRateLimits: limits.count, auditLogsPurged: audit }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
