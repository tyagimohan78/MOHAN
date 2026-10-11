/* Create or reset an administrator account.
   Usage: ADMIN_EMAIL=you@ntso.in ADMIN_PASSWORD='...' ADMIN_NAME='Mohan Tyagi' npm run admin:create
   Optional: ADMIN_ROLE=ADMIN|SALES|SUPPORT|CONTENT (default ADMIN). Credentials are never hard-coded.
   ADMIN_ONLY_IF_NONE=true: do nothing if any ADMIN account already exists (safe to run on every start). */
import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const role = (process.env.ADMIN_ROLE || "ADMIN") as Role;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  if (!["ADMIN", "SALES", "SUPPORT", "CONTENT"].includes(role)) throw new Error("ADMIN_ROLE must be ADMIN, SALES, SUPPORT or CONTENT.");
  // Bootstrap mode (used on container start): only create the first admin; never reset existing passwords.
  if (process.env.ADMIN_ONLY_IF_NONE === "true" && (await db.adminUser.count({ where: { role: "ADMIN" } })) > 0) {
    console.log("An admin account already exists; initial admin not created.");
    return;
  }
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must be at least 12 characters and include upper-case, lower-case letters and a number.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash, name, role, active: true },
    create: { email, passwordHash, name, role },
  });
  await db.session.deleteMany({ where: { userId: user.id } });
  await db.auditLog.create({ data: { userId: user.id, action: "admin.cli_upsert", entityType: "AdminUser", entityId: user.id } });
  console.log(`Admin account ready: ${user.email} (${user.role}).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
