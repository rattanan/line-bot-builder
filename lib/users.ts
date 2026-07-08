import { executeQuery, QueryResult } from "./mysql";
import { createToken, hashPassword, hashToken, verifyPassword } from "./auth";

export type UserRole = "USER" | "ADMIN";

export type AppUser = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  credit_balance: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type UserRow = AppUser & {
  password_hash: string | null;
  password_salt: string | null;
  google_sub: string | null;
};

async function getUserSelectColumns(includeSecret = false) {
  const columns = includeSecret
    ? "id, email, full_name, password_hash, password_salt, google_sub, role, credit_balance, email_verified_at, created_at, updated_at"
    : "id, email, full_name, role, credit_balance, email_verified_at, created_at, updated_at";
  return columns;
}

export async function ensureSeedAdminUser() {
  const { salt, hash } = hashPassword("Demo@123456");
  await executeQuery(
    `INSERT INTO users (email, full_name, password_hash, password_salt, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       password_hash = VALUES(password_hash),
       password_salt = VALUES(password_salt),
       role = VALUES(role),
       email_verified_at = COALESCE(email_verified_at, VALUES(email_verified_at)),
       updated_at = CURRENT_TIMESTAMP`,
    ["admin@line-bot-builder.local", "Admin", hash, salt, "ADMIN"]
  );

  return findUserByEmail("admin@line-bot-builder.local", true);
}

export async function getUsers(): Promise<AppUser[]> {
  const result = await executeQuery<AppUser>(
    "SELECT id, email, full_name, role, credit_balance, email_verified_at, created_at, updated_at FROM users ORDER BY id ASC"
  );
  return result.rows;
}

export async function findUserByEmail(email: string, includeSecret = false): Promise<UserRow | null> {
  const columns = await getUserSelectColumns(includeSecret);
  const sql = `SELECT ${columns} FROM users WHERE email = ? LIMIT 1`;
  const result: QueryResult<UserRow> = await executeQuery<UserRow>(sql, [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: number, includeSecret = false): Promise<UserRow | null> {
  const columns = await getUserSelectColumns(includeSecret);
  const sql = `SELECT ${columns} FROM users WHERE id = ? LIMIT 1`;
  const result: QueryResult<UserRow> = await executeQuery<UserRow>(sql, [id]);
  return result.rows[0] ?? null;
}

export async function findUserByGoogleSub(googleSub: string) {
  const columns = await getUserSelectColumns(true);
  const result = await executeQuery<UserRow>(`SELECT ${columns} FROM users WHERE google_sub = ? LIMIT 1`, [googleSub]);
  return result.rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  fullName: string;
  password: string;
  role?: UserRole;
  emailVerifiedAt?: string | null;
}) {
  const { salt, hash } = hashPassword(input.password);
  try {
    const result = await executeQuery(
      `INSERT INTO users (email, full_name, password_hash, password_salt, role, credit_balance, email_verified_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 50, ?, CURRENT_TIMESTAMP)`,
      [input.email, input.fullName, hash, salt, input.role ?? "USER", input.emailVerifiedAt ?? null]
    );
    if (!result.insertId) return null;
    return findUserById(result.insertId);
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      const dup = new Error("email already exists");
      (dup as Error & { code?: string }).code = "EMAIL_EXISTS";
      throw dup;
    }
    throw error;
  }
}

export async function createGoogleUser(input: {
  email: string;
  fullName: string;
  googleSub: string;
  role?: UserRole;
  emailVerifiedAt?: string | null;
}) {
  const result = await executeQuery(
    `INSERT INTO users (email, full_name, google_sub, role, credit_balance, email_verified_at, updated_at)
     VALUES (?, ?, ?, ?, 50, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       google_sub = VALUES(google_sub),
       email_verified_at = COALESCE(email_verified_at, VALUES(email_verified_at)),
       updated_at = CURRENT_TIMESTAMP`,
    [input.email, input.fullName, input.googleSub, input.role ?? "USER", input.emailVerifiedAt ?? null]
  );
  const id = result.insertId || (await findUserByEmail(input.email))?.id;
  return id ? findUserById(id) : null;
}

export async function updateUser(
  id: number,
  input: {
    fullName?: string;
    password?: string;
    role?: UserRole;
    emailVerifiedAt?: string | null;
  }
) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];

  if (input.fullName) {
    updates.push("full_name = ?");
    params.push(input.fullName);
  }
  if (input.role) {
    updates.push("role = ?");
    params.push(input.role);
  }
  if (input.emailVerifiedAt !== undefined) {
    updates.push("email_verified_at = ?");
    params.push(input.emailVerifiedAt);
  }
  if (input.password) {
    const { salt, hash } = hashPassword(input.password);
    updates.push("password_hash = ?");
    updates.push("password_salt = ?");
    params.push(hash, salt);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);
  await executeQuery(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  return findUserById(id);
}

export async function deleteUser(id: number) {
  await executeQuery("DELETE FROM users WHERE id = ?", [id]);
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email, true);
  if (!user || !user.password_hash || !user.password_salt) return null;
  const ok = verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    emailVerifiedAt: user.email_verified_at,
  };
}

export async function createVerificationToken(userId: number) {
  const token = createToken();
  await executeQuery(
    "INSERT INTO auth_tokens (user_id, token_hash, type, expires_at) VALUES (?, ?, 'email_verify', DATE_ADD(NOW(), INTERVAL 24 HOUR))",
    [userId, hashToken(token)]
  );
  return token;
}

export async function createResetToken(userId: number) {
  const token = createToken();
  await executeQuery(
    "INSERT INTO auth_tokens (user_id, token_hash, type, expires_at) VALUES (?, ?, 'password_reset', DATE_ADD(NOW(), INTERVAL 1 HOUR))",
    [userId, hashToken(token)]
  );
  return token;
}

export async function consumeToken(type: "email_verify" | "password_reset", token: string) {
  const tokenHash = hashToken(token);
  const result = await executeQuery<{ user_id: number }>(
    "SELECT user_id FROM auth_tokens WHERE token_hash = ? AND type = ? AND expires_at > NOW() LIMIT 1",
    [tokenHash, type]
  );
  const row = result.rows[0];
  if (!row) return null;
  await executeQuery("DELETE FROM auth_tokens WHERE token_hash = ? AND type = ?", [tokenHash, type]);
  return row.user_id;
}
