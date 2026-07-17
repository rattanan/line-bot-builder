import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById, updateBot } from "@/lib/bots";
import { isAllowedWidgetImageUrl } from "@/lib/widget-config";

export async function POST(_req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/line-connection-test">) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!bot.line_channel_access_token || !bot.line_channel_secret) {
    return NextResponse.json({
      ok: false,
      message: "กรุณากรอก Channel Secret และ Channel Access Token ให้ครบก่อน",
    });
  }

  const response = await fetch("https://api.line.me/v2/bot/info", {
    headers: {
      Authorization: `Bearer ${bot.line_channel_access_token}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({
      ok: false,
      message: "เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบ token และสิทธิ์ของ channel อีกครั้ง",
      status: response.status,
    });
  }

  const data = await response.json() as { pictureUrl?: unknown };
  const pictureUrl = typeof data.pictureUrl === "string" && isAllowedWidgetImageUrl(data.pictureUrl, _req.nextUrl.origin)
    ? data.pictureUrl
    : null;
  if (pictureUrl && pictureUrl !== bot.bot_profile_image_url) {
    await updateBot(bot.id, { bot_profile_image_url: pictureUrl });
  }
  return NextResponse.json({ ok: true, data });
}
