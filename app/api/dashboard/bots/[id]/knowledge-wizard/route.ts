import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createBotKnowledgeWizard, getLatestWizardForBot } from "@/lib/bot-knowledge-wizard";
import { getBotById } from "@/lib/bots";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const wizard = await getLatestWizardForBot(bot.id);
  return NextResponse.json({ wizard });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const wizard = await createBotKnowledgeWizard({
    botId: bot.id,
    userId,
    websiteUrl: body.websiteUrl ? String(body.websiteUrl).trim() : null,
  });

  return NextResponse.json({ wizard }, { status: 201 });
}
