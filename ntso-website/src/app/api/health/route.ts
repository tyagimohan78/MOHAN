import { db } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";

export const dynamic = "force-dynamic";

// Liveness/readiness probe for load balancers and uptime monitors. Reveals no configuration details.
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok", latencyMs: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    logger.error("health.db_unavailable", {}, err);
    return Response.json({ status: "error", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
