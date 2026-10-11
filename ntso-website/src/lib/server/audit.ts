import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getClientIp } from "./request";

export async function audit(userId: string | null, action: string, entityType: string, entityId?: string | null, details?: Prisma.InputJsonValue) {
  try {
    await db.auditLog.create({ data: { userId, action, entityType, entityId: entityId ?? null, details, ip: await getClientIp() } });
  } catch (err) {
    console.error("[audit] failed to write", action, err);
  }
}
