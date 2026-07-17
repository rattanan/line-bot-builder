import { executeQuery, withTransaction } from "./mysql";
import { randomBytes } from "crypto";
import type { WidgetDefaultIcon, WidgetLauncherIconType, WidgetLauncherPosition, WidgetLauncherShape } from "./widget-appearance";

export type BotStatus = "active" | "suspended";

export type Bot = {
  id: number;
  user_id: number;
  bot_name: string;
  created_at: string;
  updated_at: string | null;
};

export type BotDetail = Bot & {
  business_name: string;
  business_description: string;
  system_prompt: string;
  bot_profile_image_url: string | null;
  line_channel_secret: string | null;
  line_channel_access_token: string | null;
  widget_primary_color: string;
  widget_launcher_icon_type: WidgetLauncherIconType;
  widget_default_icon: WidgetDefaultIcon;
  widget_custom_icon_url: string | null;
  widget_launcher_shape: WidgetLauncherShape;
  widget_launcher_position: WidgetLauncherPosition;
  widget_horizontal_offset: number;
  widget_bottom_offset: number;
  widget_show_dismiss_button: number;
  widget_public_token: string;
  credit_balance: number;
  status: BotStatus;
};

export async function getBotById(id: number): Promise<BotDetail | null> {
  const result = await executeQuery<BotDetail>(
    `SELECT id, user_id, bot_name, business_name, business_description, system_prompt,
            bot_profile_image_url, line_channel_secret, line_channel_access_token,
            widget_primary_color, widget_launcher_icon_type, widget_default_icon,
            widget_custom_icon_url, widget_launcher_shape, widget_launcher_position,
            widget_horizontal_offset, widget_bottom_offset, widget_show_dismiss_button,
            widget_public_token, credit_balance, status,
            created_at, updated_at
     FROM bots
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getBotsByUserId(userId: number): Promise<BotDetail[]> {
  const result = await executeQuery<BotDetail>(
    `SELECT id, user_id, bot_name, business_name, business_description, system_prompt,
            bot_profile_image_url, line_channel_secret, line_channel_access_token,
            widget_primary_color, widget_launcher_icon_type, widget_default_icon,
            widget_custom_icon_url, widget_launcher_shape, widget_launcher_position,
            widget_horizontal_offset, widget_bottom_offset, widget_show_dismiss_button,
            widget_public_token, credit_balance, status,
            created_at, updated_at
     FROM bots
     WHERE user_id = ?
     ORDER BY id DESC`,
    [userId]
  );
  return result.rows;
}

export async function createBot(input: {
  userId: number;
  botName: string;
  businessName: string;
  businessDescription: string;
  systemPrompt: string;
  lineChannelSecret: string;
  lineChannelAccessToken: string;
}) {
  const result = await executeQuery(
    `INSERT INTO bots (
      user_id, bot_name, business_name, business_description, system_prompt,
      line_channel_secret, line_channel_access_token, widget_public_token, credit_balance, status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', CURRENT_TIMESTAMP)`,
    [
      input.userId,
      input.botName,
      input.businessName,
      input.businessDescription,
      input.systemPrompt,
      input.lineChannelSecret,
      input.lineChannelAccessToken,
      randomBytes(32).toString("hex"),
    ]
  );
  return result.insertId ? getBotById(result.insertId) : null;
}

export async function createBotWithFaqs(input: {
  userId: number;
  botName: string;
  businessName: string;
  businessDescription: string;
  systemPrompt: string;
  lineChannelSecret: string;
  lineChannelAccessToken: string;
  faqs: Array<{ question: string; answer: string; isActive?: boolean }>;
}) {
  return withTransaction(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO bots (
        user_id, bot_name, business_name, business_description, system_prompt,
        line_channel_secret, line_channel_access_token, widget_public_token, credit_balance, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', CURRENT_TIMESTAMP)`,
      [
        input.userId,
        input.botName,
        input.businessName,
        input.businessDescription,
        input.systemPrompt,
        input.lineChannelSecret,
        input.lineChannelAccessToken,
        randomBytes(32).toString("hex"),
      ]
    );
    const botId = (result as { insertId?: number }).insertId;
    if (!botId) throw new Error("Failed to create agent");

    for (const faq of input.faqs) {
      await connection.execute(
        "INSERT INTO faq (bot_id, question, answer, is_active) VALUES (?, ?, ?, ?)",
        [botId, faq.question, faq.answer, faq.isActive === false ? 0 : 1]
      );
    }

    const [botRows] = await connection.execute(
      `SELECT id, user_id, bot_name, business_name, business_description, system_prompt,
              bot_profile_image_url, line_channel_secret, line_channel_access_token,
              widget_primary_color, widget_launcher_icon_type, widget_default_icon,
              widget_custom_icon_url, widget_launcher_shape, widget_launcher_position,
              widget_horizontal_offset, widget_bottom_offset, widget_show_dismiss_button,
              widget_public_token, credit_balance, status,
              created_at, updated_at
       FROM bots
       WHERE id = ?
       LIMIT 1`,
      [botId]
    );
    const bot = Array.isArray(botRows) ? ((botRows[0] as BotDetail | undefined) ?? null) : null;
    return bot;
  });
}

export async function updateBot(
  id: number,
  input: Partial<Omit<BotDetail, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];
  const mapping: Record<string, string> = {
    bot_name: "bot_name",
    business_name: "business_name",
    business_description: "business_description",
    system_prompt: "system_prompt",
    bot_profile_image_url: "bot_profile_image_url",
    line_channel_secret: "line_channel_secret",
    line_channel_access_token: "line_channel_access_token",
    widget_primary_color: "widget_primary_color",
    widget_launcher_icon_type: "widget_launcher_icon_type",
    widget_default_icon: "widget_default_icon",
    widget_custom_icon_url: "widget_custom_icon_url",
    widget_launcher_shape: "widget_launcher_shape",
    widget_launcher_position: "widget_launcher_position",
    widget_horizontal_offset: "widget_horizontal_offset",
    widget_bottom_offset: "widget_bottom_offset",
    widget_show_dismiss_button: "widget_show_dismiss_button",
    credit_balance: "credit_balance",
    status: "status",
  };

  for (const [key, column] of Object.entries(mapping)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      updates.push(`${column} = ?`);
      params.push(value as string | number | null);
    }
  }

  if (!updates.length) return getBotById(id);
  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);
  await executeQuery(`UPDATE bots SET ${updates.join(", ")} WHERE id = ?`, params);
  return getBotById(id);
}

export async function deleteBot(id: number) {
  await withTransaction(async (connection) => {
    await connection.execute("DELETE FROM faq WHERE bot_id = ?", [id]);
    await connection.execute("DELETE FROM bot_usage_logs WHERE bot_id = ?", [id]);
    await connection.execute("DELETE FROM chat_log WHERE bot_id = ?", [id]);
    await connection.execute("DELETE FROM bots WHERE id = ?", [id]);
  });
}
