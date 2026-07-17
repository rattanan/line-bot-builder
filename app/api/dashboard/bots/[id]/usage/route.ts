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
      business_name: bot.business_name,
      business_description: bot.business_description,
      system_prompt: bot.system_prompt,
      bot_profile_image_url: bot.bot_profile_image_url,
      line_channel_secret: bot.line_channel_secret,
      line_channel_access_token: bot.line_channel_access_token,
      credit_balance: summary?.remaining_credit ?? 0,
      status: bot.status,
    },
  });
}
