import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { getBotUsageLogs, getBotUsageSummary } from "@/lib/bot-usage";

export async function GET(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/usage">) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
  const [summary, logs] = await Promise.all([
    getBotUsageSummary(botId),
    getBotUsageLogs(botId, Number.isFinite(limit) ? limit : 50),
  ]);

  return NextResponse.json({
    summary,
    logs,
    bot: {
      id: bot.id,
      bot_name: bot.bot_name,
      credit_balance: bot.credit_balance,
      status: bot.status,
    },
  });
}
