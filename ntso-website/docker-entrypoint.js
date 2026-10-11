/*
 * Container entrypoint.
 * Starts as root only to make the upload directory writable (platform disks such as Render's are
 * often mounted root-owned), then runs database migrations and the web server as the unprivileged
 * `app` user. If the container is already started as a non-root user, it simply runs both steps.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const APP_UID = Number(process.env.APP_UID || 1001);
const APP_GID = Number(process.env.APP_GID || 1001);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "/data/uploads");
const isRoot = typeof process.getuid === "function" && process.getuid() === 0;

function chownTree(dir) {
  fs.chownSync(dir, APP_UID, APP_GID);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) chownTree(p);
    else fs.chownSync(p, APP_UID, APP_GID);
  }
}

if (isRoot && (process.env.STORAGE_DRIVER || "local") === "local") {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    chownTree(uploadDir);
  } catch (err) {
    console.error(JSON.stringify({ level: "error", event: "entrypoint.upload_dir_chown_failed", dir: uploadDir, error: String(err) }));
  }
}

const dropTo = isRoot ? { uid: APP_UID, gid: APP_GID } : {};
execFileSync(process.execPath, ["/prisma-cli/node_modules/prisma/build/index.js", "migrate", "deploy", "--schema", "prisma/schema.prisma"], {
  stdio: "inherit",
  env: { ...process.env, HOME: "/tmp" },
  ...dropTo,
});

// Optional first-run bootstrap (useful on hosts without shell access):
//   SEED_ON_START=true                 → load categories, sample catalogue, services and FAQs (idempotent)
//   INITIAL_ADMIN_EMAIL / _PASSWORD / _NAME → create the first ADMIN account only if none exists yet
const runOps = (script, extraEnv) =>
  execFileSync(process.execPath, [script], { stdio: "inherit", env: { ...process.env, HOME: "/tmp", ...extraEnv }, ...dropTo });
if (process.env.SEED_ON_START === "true") runOps("ops/seed.js");
if (process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_PASSWORD) {
  try {
    runOps("ops/create-admin.js", {
      ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD,
      ADMIN_NAME: process.env.INITIAL_ADMIN_NAME || "Administrator",
      ADMIN_ROLE: "ADMIN",
      ADMIN_ONLY_IF_NONE: "true",
    });
  } catch {
    console.error(JSON.stringify({ level: "error", event: "entrypoint.initial_admin_failed" }));
  }
}

if (isRoot) {
  process.setgid(APP_GID);
  process.setuid(APP_UID);
}
process.env.HOME = "/tmp";
require("./server.js");
