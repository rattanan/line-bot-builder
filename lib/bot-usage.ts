import { executeQuery, QueryResult, withTransaction } from "./mysql";

export type BotUsageStatus = "consumed" | "insufficient" | "suspended" | "not_found";
export type BotUsageSource = "mysql_faq" | "ai" | "fallback" | "credit_block";

export type BotUsageLog = {
  id: number;
  bot_id: number;
  line_user_id: string;
  user_message: string;
  credit_before: number;
  credit_after: number;
  status: BotUsageStatus;
  source: BotUsageSource;
  created_at: string;
};

export async function getBotUsageLogs(botId: number, limit = 50): Promise<BotUsageLog[]> {
  const result = await executeQuery<BotUsageLog>(
    `SELECT id, bot_id, line_user_id, user_message, credit_before, credit_after, status, source, created_at
     FROM bot_usage_logs
     WHERE bot_id = ?
     ORDER BY id DESC
     LIMIT ?`,
    [botId, limit]
  );
  return result.rows;
}

export async function getBotUsageSummary(botId: number) {
  const result = await executeQuery<{
    total_logs: number;
    consumed_logs: number;
    blocked_logs: number;
    faq_hits: number;
    ai_hits: number;
    fallback_hits: number;
    remaining_credit: number;
  }>(
    `SELECT
      COUNT(*) AS total_logs,
      SUM(CASE WHEN status = 'consumed' THEN 1 ELSE 0 END) AS consumed_logs,
      SUM(CASE WHEN status = 'insufficient' THEN 1 ELSE 0 END) AS blocked_logs,
      SUM(CASE WHEN source = 'mysql_faq' THEN 1 ELSE 0 END) AS faq_hits,
      SUM(CASE WHEN source = 'ai' THEN 1 ELSE 0 END) AS ai_hits,
      SUM(CASE WHEN source = 'fallback' THEN 1 ELSE 0 END) AS fallback_hits,
      COALESCE((SELECT u.credit_balance FROM bots b INNER JOIN users u ON u.id = b.user_id WHERE b.id = ? LIMIT 1), 0) AS remaining_credit
     FROM bot_usage_logs
     WHERE bot_id = ?`,
    [botId, botId]
  );
  return result.rows[0] ?? null;
}

export async function consumeBotCredit(input: {
  botId: number;
  lineUserId: string;
  userMessage: string;
}) {
  return withTransaction(async (connection) => {
    const [botRows] = await connection.execute(
      `SELECT b.id, b.status, u.id AS user_id, u.credit_balance
       FROM bots b
       INNER JOIN users u ON u.id = b.user_id
       WHERE b.id = ?
       FOR UPDATE`,
      [input.botId]
    );
    const bot = Array.isArray(botRows)
      ? (botRows[0] as { id: number; user_id: number; credit_balance: number; status: string } | undefined)
      : undefined;

    if (!bot) {
      await connection.execute(
        `INSERT INTO bot_usage_logs (bot_id, line_user_id, user_message, credit_before, credit_after, status, source)
         VALUES (?, ?, ?, 0, 0, 'not_found', 'credit_block')`,
        [input.botId, input.lineUserId, input.userMessage]
      );
      return { ok: false as const, reason: "not_found" as const, creditBefore: 0, creditAfter: 0 };
    }

    if (bot.status !== "active") {
      await connection.execute(
        `INSERT INTO bot_usage_logs (bot_id, line_user_id, user_message, credit_before, credit_after, status, source)
         VALUES (?, ?, ?, ?, ?, 'suspended', 'credit_block')`,
        [bot.id, input.lineUserId, input.userMessage, bot.credit_balance, bot.credit_balance]
      );
      return { ok: false as const, reason: "suspended" as const, creditBefore: bot.credit_balance, creditAfter: bot.credit_balance };
    }

    if (bot.credit_balance <= 0) {
      await connection.execute(
        `INSERT INTO bot_usage_logs (bot_id, line_user_id, user_message, credit_before, credit_after, status, source)
         VALUES (?, ?, ?, 0, 0, 'insufficient', 'credit_block')`,
        [bot.id, input.lineUserId, input.userMessage]
      );
      return { ok: false as const, reason: "insufficient" as const, creditBefore: 0, creditAfter: 0 };
    }

    const creditAfter = bot.credit_balance - 1;
    await connection.execute("UPDATE users SET credit_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [creditAfter, bot.user_id]);
    await connection.execute(
      `INSERT INTO credit_transactions (bot_id, user_id, type, amount, balance_before, balance_after, ref_type, ref_id, reason)
       VALUES (?, ?, 'usage', -1, ?, ?, 'line_message', ?, ?)`,
      [bot.id, bot.user_id, bot.credit_balance, creditAfter, bot.id, "LINE message usage"]
    );
    return { ok: true as const, reason: "consumed" as const, creditBefore: bot.credit_balance, creditAfter };
  });
}

export async function recordBotUsage(input: {
  botId: number;
  lineUserId: string;
  userMessage: string;
  creditBefore: number;
  creditAfter: number;
  status: BotUsageStatus;
  source: BotUsageSource;
}) {
  await executeQuery(
    `INSERT INTO bot_usage_logs (bot_id, line_user_id, user_message, credit_before, credit_after, status, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [input.botId, input.lineUserId, input.userMessage, input.creditBefore, input.creditAfter, input.status, input.source]
  );
}

export async function addBotCredits(input: {
  botId: number;
  amount: number;
  reason: string;
  adminEmail: string;
}) {
  if (input.amount <= 0) throw new Error("amount must be positive");

  return withTransaction(async (connection) => {
    const [botRows] = await connection.execute(
      `SELECT b.id, b.user_id, u.credit_balance
       FROM bots b
       INNER JOIN users u ON u.id = b.user_id
       WHERE b.id = ?
       FOR UPDATE`,
      [input.botId]
    );
    const bot = Array.isArray(botRows) ? (botRows[0] as { id: number; user_id: number; credit_balance: number } | undefined) : undefined;
    if (!bot) return null;

    const nextBalance = bot.credit_balance + input.amount;
    await connection.execute("UPDATE users SET credit_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [nextBalance, bot.user_id]);
    await connection.execute(
      `INSERT INTO credit_transactions (bot_id, user_id, type, amount, balance_before, balance_after, reason, admin_email)
       VALUES (?, ?, 'adjustment', ?, ?, ?, ?, ?)`,
      [bot.id, bot.user_id, input.amount, bot.credit_balance, nextBalance, input.reason, input.adminEmail]
    );
    return { botId: bot.id, creditBalance: nextBalance };
  });
}

export async function setBotStatus(botId: number, status: "active" | "suspended") {
  await executeQuery("UPDATE bots SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, botId]);
}
