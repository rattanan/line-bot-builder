import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { deleteBot, getBotById, updateBot } from "@/lib/bots";

export async function PATCH(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]">) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const botId = Number((await context.params).id);
  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const lineChannelSecret = String(body.lineChannelSecret || "").trim();
  const lineChannelAccessToken = String(body.lineChannelAccessToken || "").trim();

  const updated = await updateBot(botId, {
    line_channel_secret: lineChannelSecret || null,
    line_channel_access_token: lineChannelAccessToken || null,
  });

  return NextResponse.json({
    ok: true,
    bot: updated,
  });
}

export async function DELETE(_req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]">) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const botId = Number((await context.params).id);
    const bot = await getBotById(botId);
    if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteBot(botId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete agent failed:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
