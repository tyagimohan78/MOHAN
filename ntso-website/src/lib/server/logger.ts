import "server-only";

/**
 * Minimal structured logger: one JSON line per event, suitable for Docker / platform log collectors.
 * Never pass passwords, access keys, tokens or full form contents in `context`.
 */
type Level = "info" | "warn" | "error";

function write(level: Level, event: string, context?: Record<string, unknown>, err?: unknown) {
  const entry: Record<string, unknown> = { level, event, time: new Date().toISOString(), ...context };
  if (err) entry.error = err instanceof Error ? { name: err.name, message: err.message, stack: process.env.NODE_ENV === "production" ? undefined : err.stack } : String(err);
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => write("info", event, context),
  warn: (event: string, context?: Record<string, unknown>, err?: unknown) => write("warn", event, context, err),
  error: (event: string, context?: Record<string, unknown>, err?: unknown) => write("error", event, context, err),
};
