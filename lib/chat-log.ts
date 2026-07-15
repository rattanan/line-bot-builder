import { getMySQLPool } from "@/lib/mysql";

export type ConversationChannel = "line" | "web" | "test" | "unknown";

export interface ChatLog {
  id?: number;
  userId: string;
  botId?: number | null;
  botName?: string | null;
  channel?: ConversationChannel;
  question: string;
  answer: string;
  source: "mysql_faq" | "ai" | "fallback";
  createdAt?: string;
}

export type ChatLogSortBy = "created_at" | "user_id" | "answer_source";
export type ChatLogSortOrder = "asc" | "desc";

/**
 * Save chat interaction to MySQL database
 * @param log - Chat log entry
 */
export async function saveChatLog(log: ChatLog): Promise<void> {
  const pool = getMySQLPool();
  let connection;
  
  try {
    connection = await pool.getConnection();
    const query = `
      INSERT INTO chat_log (user_id, bot_id, channel, user_message, bot_reply, answer_source)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(query, [
      log.userId,
      log.botId ?? null,
      log.channel ?? "unknown",
      log.question,
      log.answer,
      log.source,
    ]);
  } catch (error) {
    console.error("Error saving chat log:", error);
    // Don't throw - chat logging should not break the bot
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * Get chat history for a user
 * @param userId - User's LINE ID
 * @param limit - Number of recent messages to fetch (default 20)
 * @returns Array of chat logs ordered by timestamp descending
 */
export async function getChatHistory(
  options: {
    userId?: string;
    limit?: number;
    offset?: number;
    sortBy?: ChatLogSortBy;
    sortOrder?: ChatLogSortOrder;
  } = {}
): Promise<{ rows: ChatLog[]; total: number }> {
  const pool = getMySQLPool();
  let connection;
  const {
    userId,
    limit = 20,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  const sortColumnMap: Record<ChatLogSortBy, string> = {
    created_at: "created_at",
    user_id: "user_id",
    answer_source: "answer_source",
  };

  const orderDirection = sortOrder === "asc" ? "ASC" : "DESC";

  try {
    connection = await pool.getConnection();

    const whereClause = userId ? "WHERE user_id = ?" : "";
    const params: Array<string | number> = [];

    if (userId) {
      params.push(userId);
    }

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as total FROM chat_log ${whereClause}`,
      params
    );
    const total = Array.isArray(countRows) && countRows.length > 0 ? Number((countRows as Array<{ total: number }>)[0].total) : 0;

    params.push(limit, offset);

    const query = `
      SELECT user_id as userId, user_message as question, bot_reply as answer, answer_source as source
      FROM chat_log
      ${whereClause}
      ORDER BY ${sortColumnMap[sortBy]} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await connection.execute(query, params);
    return { rows: rows as ChatLog[], total };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return { rows: [], total: 0 };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
