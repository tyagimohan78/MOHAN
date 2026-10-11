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

if (isRoot) {
  process.setgid(APP_GID);
  process.setuid(APP_UID);
}
process.env.HOME = "/tmp";
require("./server.js");
