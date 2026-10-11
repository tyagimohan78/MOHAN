import "server-only";
import { logger } from "./logger";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getClientIp } from "./request";

export async function audit(userId: string | null, action: string, entityType: string, entityId?: string | null, details?: Prisma.InputJsonValue) {
  try {
    await db.auditLog.create({ data: { userId, action, entityType, entityId: entityId ?? null, details, ip: await getClientIp() } });
  } catch (err) {
    logger.error("audit.write_failed", { action }, err);
  }
}
