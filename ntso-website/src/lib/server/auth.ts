import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import type { AdminUser, Role } from "@prisma/client";
import { db } from "./db";
import { sha256 } from "./crypto";
import { config } from "./config";
import { getUserAgent } from "./request";

export const SESSION_COOKIE = "ntso_admin_session";
const BCRYPT_COST = 12;
// Pre-computed hash used to keep login timing similar for unknown accounts.
const DUMMY_HASH = "$2b$12$LgUbL4axFBICDDbVwpYET.Stv4PMqO2LOoxkMu1/P/zp8Q0Hstdo6";

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

export type Permission = "enquiries" | "customers" | "tickets" | "catalog" | "content" | "settings" | "users" | "audit";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ["enquiries", "customers", "tickets", "catalog", "content", "settings", "users", "audit"],
  SALES: ["enquiries", "customers"],
  SUPPORT: ["tickets", "customers"],
  CONTENT: ["catalog", "content"],
};

export const can = (role: Role, perm: Permission) => ROLE_PERMISSIONS[role].includes(perm);

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.active) return null;
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + config.sessionDays * 86_400_000);
  await db.session.create({ data: { id: sha256(token), userId, expiresAt, userAgent: await getUserAgent() } });
  await db.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<AdminUser, "id" | "email" | "name" | "role">;

/** Validates the session cookie against the database. Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const session = await db.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now() || !session.user.active) {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  // Sliding expiry: extend in the database when less than half the lifetime remains.
  const lifetime = config.sessionDays * 86_400_000;
  if (session.expiresAt.getTime() - Date.now() < lifetime / 2) {
    await db.session.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() + lifetime) } }).catch(() => undefined);
  }
  const { id, email, name, role } = session.user;
  return { id, email, name, role };
});

/** For pages: redirect to login when unauthenticated, to dashboard when not permitted. */
export async function requirePage(perm?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (perm && !can(user.role, perm)) redirect("/admin?denied=1");
  return user;
}

export class AuthError extends Error {}

/** For server actions: throws instead of redirecting so actions fail closed. */
export async function requireAction(perm: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Not signed in");
  if (!can(user.role, perm)) throw new AuthError("Not permitted");
  return user;
}
