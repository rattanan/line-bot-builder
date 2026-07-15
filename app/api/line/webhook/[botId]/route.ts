import { validateSignature } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";
import { getBotById } from "@/lib/bots";
import { replyMessage } from "@/lib/line";
import { generateBotAnswer } from "@/lib/bot-runtime";

const LINE_TEXT_LIMIT = 5000;

type LineWebhookEvent = {
  type: string;
  replyToken: string;
  message?: {
    type: string;
    text?: string;
  };
  source?: {
    type: string;
    userId?: string;
  };
};

function toLineText(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= LINE_TEXT_LIMIT) return trimmed;
  return `${trimmed.slice(0, LINE_TEXT_LIMIT - 24)}\n\n(คำตอบยาวเกินไปเลยตัดจบไว้ตรงนี้)`;
}

export async function POST(req: NextRequest, context: RouteContext<"/api/line/webhook/[botId]">) {
  try {
    const botId = Number((await context.params).botId);
    if (!Number.isFinite(botId)) {
      return NextResponse.json({ success: false, error: "Invalid agent ID" }, { status: 400 });
    }

    const bot = await getBotById(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
    }

    const signature = req.headers.get("x-line-signature");
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await req.text();
    const secret = bot.line_channel_secret || "";
    if (!secret || !validateSignature(rawBody, secret, signature)) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as { events?: LineWebhookEvent[] };
    const events: LineWebhookEvent[] = body.events || [];
    if (!events.length) return NextResponse.json({ ok: true });
    if (bot.status !== "active") return NextResponse.json({ ok: true });

    await Promise.all(
      events.map(async (event) => {
        if (event.type !== "message") return;
        if (event.message?.type !== "text" || !event.message.text) return;

        const question = event.message.text;
        const userId = event.source?.userId || "line:unknown";
        const { reply, source } = await generateBotAnswer(botId, question, {
          userId,
          channel: "line",
        });

        console.log(`[LINE Webhook][bot:${botId}] Question: "${question}" -> Source: ${source}`);
        await replyMessage(bot.line_channel_access_token || "", event.replyToken, toLineText(reply));
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
