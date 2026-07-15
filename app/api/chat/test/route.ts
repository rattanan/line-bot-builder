import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { generateBotAnswer } from "@/lib/bot-runtime";
import { getBotById } from "@/lib/bots";

/**
 * POST /api/chat/test
 * Test endpoint for agent answer generation
 * 
 * Request body:
 * {
 *   "botId": 1,
 *   "message": "user question"
 * }
 * 
 * Response:
 * {
 *   "reply": "bot answer",
 *   "source": "mysql_faq" | "ai" | "fallback"
 * }
 */
export async function POST(req: NextRequest) {
  // Check if chat test is enabled
  const chatTestEnabled = process.env.CHAT_TEST_ENABLED === "true";

  if (!chatTestEnabled) {
    return NextResponse.json(
      { error: "Chat test is disabled. Set CHAT_TEST_ENABLED=true to enable." },
      { status: 403 }
    );
  }

  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const botId = Number(body.botId);
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!Number.isInteger(botId) || botId <= 0 || !message) {
      return NextResponse.json(
        { error: "Invalid request body. Expected { botId: number, message: string }" },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message must be 2,000 characters or fewer." }, { status: 400 });
    }

    const bot = await getBotById(botId);
    if (!bot || bot.user_id !== sessionUserId) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Use the same scoped runtime as LINE and the web widget so the result
    // reflects this agent's published FAQ, prompt, credits, and chat logging.
    const { reply, source } = await generateBotAnswer(botId, message, {
      userId: `test:${sessionUserId}`,
      channel: "test",
      consumeCredit: false,
    });

    return NextResponse.json({
      reply,
      source,
      botId,
      botName: bot.bot_name,
    });
  } catch (error) {
    console.error("Chat test API Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
