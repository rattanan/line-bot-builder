import { executeQuery } from "./mysql";

export async function getAdminDashboardSummary() {
  const result = await executeQuery<{
    total_users: number;
    total_bots: number;
    suspended_bots: number;
    total_credits: number;
    total_transactions: number;
  }>(
    `SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM bots) AS total_bots,
      (SELECT COUNT(*) FROM bots WHERE status = 'suspended') AS suspended_bots,
      (SELECT COALESCE(SUM(credit_balance), 0) FROM users) AS total_credits,
      (SELECT COUNT(*) FROM credit_transactions) AS total_transactions`
  );
  return result.rows[0] ?? null;
}

export async function getAdminUsers() {
  const result = await executeQuery<{
    id: number;
    email: string;
    full_name: string;
    role: "USER" | "ADMIN";
    email_verified_at: string | null;
    bot_count: number;
    total_credit: number;
    created_at: string;
  }>(
    `SELECT
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.email_verified_at,
      u.created_at,
      COUNT(DISTINCT b.id) AS bot_count,
      MAX(u.credit_balance) AS total_credit
     FROM users u
     LEFT JOIN bots b ON b.user_id = u.id
     GROUP BY u.id, u.email, u.full_name, u.role, u.email_verified_at, u.created_at
     ORDER BY u.id DESC`
  );
  return result.rows;
}

export async function getAdminBots() {
  const result = await executeQuery<{
    id: number;
    user_id: number;
    owner_email: string;
    owner_name: string;
    bot_name: string;
    business_name: string;
    credit_balance: number;
    status: "active" | "suspended";
    usage_count: number;
    last_used_at: string | null;
    created_at: string;
  }>(
    `SELECT
      b.id,
      b.user_id,
      u.email AS owner_email,
      u.full_name AS owner_name,
      b.bot_name,
      b.business_name,
      u.credit_balance AS credit_balance,
      b.status,
      b.created_at,
      MAX(l.created_at) AS last_used_at,
      COUNT(l.id) AS usage_count
     FROM bots b
     INNER JOIN users u ON u.id = b.user_id
     LEFT JOIN bot_usage_logs l ON l.bot_id = b.id
     GROUP BY b.id, b.user_id, u.email, u.full_name, b.bot_name, b.business_name, u.credit_balance, b.status, b.created_at
     ORDER BY b.id DESC`
  );
  return result.rows;
}

export async function getAdminBotDetail(botId: number) {
  const botResult = await executeQuery<{
    id: number;
    user_id: number;
    owner_email: string;
    owner_name: string;
    bot_name: string;
    business_name: string;
    business_description: string;
    system_prompt: string;
    credit_balance: number;
    status: "active" | "suspended";
    created_at: string;
    updated_at: string | null;
  }>(
    `SELECT
      b.id,
      b.user_id,
      u.email AS owner_email,
      u.full_name AS owner_name,
      b.bot_name,
      b.business_name,
      b.business_description,
      b.system_prompt,
      u.credit_balance AS credit_balance,
      b.status,
      b.created_at,
      b.updated_at
     FROM bots b
     INNER JOIN users u ON u.id = b.user_id
     WHERE b.id = ?
     LIMIT 1`,
    [botId]
  );

  const bot = botResult.rows[0] ?? null;
  if (!bot) return null;

  const [usageResult, txResult] = await Promise.all([
    executeQuery<{
      id: number;
      line_user_id: string;
      user_message: string;
      credit_before: number;
      credit_after: number;
      status: string;
      source: string;
      created_at: string;
    }>(
      `SELECT id, line_user_id, user_message, credit_before, credit_after, status, source, created_at
       FROM bot_usage_logs
       WHERE bot_id = ?
       ORDER BY id DESC
       LIMIT 100`,
      [botId]
    ),
    executeQuery<{
      id: number;
      amount: number;
      reason: string;
      admin_email: string;
      created_at: string;
    }>(
      `SELECT id, amount, reason, admin_email, created_at
       FROM credit_transactions
       WHERE bot_id = ? OR user_id = ?
       ORDER BY id DESC
       LIMIT 100`,
      [botId, bot.user_id]
    ),
  ]);

  return {
    bot,
    usageLogs: usageResult.rows,
    transactions: txResult.rows,
  };
}
