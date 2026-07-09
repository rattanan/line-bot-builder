import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { executeQuery } from "./mysql";

export const SESSION_COOKIE = "llb_session";

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: "USER" | "ADMIN";
  credit_balance: number;
  email_verified_at: string | null;
};

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualHash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
}

export function createToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function setSessionCookie(sessionToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function createSession(userId: number) {
  const token = createToken();
  const tokenHash = hashToken(token);
  await executeQuery(
    "INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))",
    [userId, tokenHash]
  );
  return token;
}

export async function revokeSession(token: string) {
  const tokenHash = hashToken(token);
  await executeQuery("DELETE FROM auth_sessions WHERE token_hash = ?", [tokenHash]);
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const sessionResult = await executeQuery<{ user_id: number }>(
    `SELECT user_id
     FROM auth_sessions
     WHERE token_hash = ? AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const session = sessionResult.rows[0];
  if (!session) return null;

  const userResult = await executeQuery<SessionUser>(
    `SELECT id, email, full_name, role, credit_balance, email_verified_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [session.user_id]
  );

  return userResult.rows[0] ?? null;
}

export async function getSessionUserId() {
  const user = await getSessionUser();
  return user?.id ?? null;
}

export async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
