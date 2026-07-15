import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { analyzeConversations, getConversationDashboard, saveAnalysisSnapshot } from "@/lib/business-insight";
import { getBotById } from "@/lib/bots";
import { getFAQData } from "@/lib/faq";

type InsightRouteContext = { params: Promise<{ id: string }> };

async function getOwnedBot(context: InsightRouteContext) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId || !Number.isInteger(botId) || botId <= 0) return null;
  const bot = await getBotById(botId);
  return bot?.user_id === userId ? bot : null;
}

export async function GET(
  _request: Request,
  context: InsightRouteContext
) {
  const bot = await getOwnedBot(context);
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    return NextResponse.json(await getConversationDashboard(bot.id));
  } catch (error) {
    console.error("Failed to load business insight dashboard:", error);
    return NextResponse.json({ error: "Unable to load conversations" }, { status: 500 });
  }
}

export async function POST(
  _request: Request,
  context: InsightRouteContext
) {
  const bot = await getOwnedBot(context);
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const faqs = await getFAQData(bot.id);
    const analysis = await analyzeConversations(bot, faqs);
    await saveAnalysisSnapshot(bot.id, analysis);
    return NextResponse.json({ ...analysis, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to analyze conversations:", error);
    return NextResponse.json(
      { error: "AI could not analyze conversations. Please try again." },
      { status: 502 }
    );
  }
}
