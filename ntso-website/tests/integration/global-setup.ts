import { execSync } from "node:child_process";

/**
 * Applies pending migrations to the dedicated test database (non-destructive `migrate deploy`).
 * Tests never assume an empty database: every test uses unique, per-run data.
 */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("Set TEST_DATABASE_URL to a disposable PostgreSQL database to run integration tests.");
  if (!/test/i.test(url)) throw new Error("TEST_DATABASE_URL must point to a database whose name contains 'test'.");
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
}
