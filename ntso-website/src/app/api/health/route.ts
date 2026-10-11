import { db } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";
import { checkStorageWritable } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

// Liveness/readiness probe for load balancers and uptime monitors. Reveals no configuration details.
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    // Storage problems are reported (and logged) but do not fail the probe: the site still serves pages and enquiries.
    const storage = await checkStorageWritable();
    if (storage === "error") logger.error("health.storage_unwritable", {});
    return Response.json({ status: "ok", database: "ok", storage, latencyMs: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    logger.error("health.db_unavailable", {}, err);
    return Response.json({ status: "error", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
