import { executeQuery, QueryResult } from "./mysql";
import { hashPassword } from "./auth";

export type UserRole = "admin" | "staff";

export type AppUser = {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type UserRow = AppUser & {
  password_hash: string;
  password_salt: string;
};

export async function ensureSeedAdminUser() {
  const { salt, hash } = hashPassword("Demo@123456");
  await executeQuery(
    `INSERT INTO users (username, full_name, password_hash, password_salt, role)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       password_hash = VALUES(password_hash),
       password_salt = VALUES(password_salt),
       role = VALUES(role),
       updated_at = CURRENT_TIMESTAMP`,
    ["admin", "Admin", hash, salt, "admin"]
  );

  return findUserByUsername("admin", true);
}

export async function getUsers(): Promise<AppUser[]> {
  const result = await executeQuery<AppUser>(
    "SELECT id, username, full_name, role, created_at, updated_at FROM users ORDER BY id ASC"
  );
  return result.rows;
}

export async function findUserByUsername(username: string, includeSecret = false): Promise<UserRow | null> {
  const sql = includeSecret
    ? "SELECT id, username, full_name, password_hash, password_salt, role, created_at, updated_at FROM users WHERE username = ? LIMIT 1"
    : "SELECT id, username, full_name, role, created_at, updated_at FROM users WHERE username = ? LIMIT 1";

  const result: QueryResult<UserRow> = await executeQuery<UserRow>(sql, [username]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: number, includeSecret = false): Promise<UserRow | null> {
  const sql = includeSecret
    ? "SELECT id, username, full_name, password_hash, password_salt, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1"
    : "SELECT id, username, full_name, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1";

  const result: QueryResult<UserRow> = await executeQuery<UserRow>(sql, [id]);
  return result.rows[0] ?? null;
}

export async function createUser(input: {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
}) {
  const { salt, hash } = hashPassword(input.password);
  const result = await executeQuery(
    "INSERT INTO users (username, full_name, password_hash, password_salt, role, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
    [input.username, input.fullName, hash, salt, input.role]
  );
  if (!result.insertId) return null;
  return findUserById(result.insertId);
}

export async function updateUser(
  id: number,
  input: {
    fullName?: string;
    password?: string;
    role?: UserRole;
  }
) {
  const updates: string[] = [];
  const params: Array<string | number> = [];

  if (input.fullName) {
    updates.push("full_name = ?");
    params.push(input.fullName);
  }
  if (input.role) {
    updates.push("role = ?");
    params.push(input.role);
  }
  if (input.password) {
    const { salt, hash } = hashPassword(input.password);
    updates.push("password_hash = ?");
    updates.push("password_salt = ?");
    params.push(hash, salt);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");

  if (!updates.length) return findUserById(id);
  params.push(id);
  await executeQuery(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
  return findUserById(id);
}

export async function deleteUser(id: number) {
  await executeQuery("DELETE FROM users WHERE id = ?", [id]);
}

export async function verifyUserCredentials(username: string, password: string) {
  const user = await findUserByUsername(username, true);
  if (!user) return null;
  const { verifyPassword } = await import("./auth");
  const ok = verifyPassword(password, user.password_salt, user.password_hash);
  if (!ok) return null;
  return { id: user.id, username: user.username, fullName: user.full_name, role: user.role };
}
