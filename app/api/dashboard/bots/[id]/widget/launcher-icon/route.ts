import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById, updateBot } from "@/lib/bots";
import { removeWidgetIcon, storeWidgetIcon } from "@/lib/widget-icon-storage";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: Context) {
  try {
    const bot = await getOwnedBot(context);
    if (bot instanceof NextResponse) return bot;
    const formData = await req.formData();
    const icon = formData.get("icon");
    if (!(icon instanceof File)) return NextResponse.json({ error: "Icon file is required" }, { status: 400 });
    const url = await storeWidgetIcon(icon, bot.id);
    const previousUrl = bot.widget_custom_icon_url;
    const updated = await updateBot(bot.id, { widget_custom_icon_url: url, widget_launcher_icon_type: "custom" });
    await removeWidgetIcon(previousUrl, bot.id);
    return NextResponse.json({ ok: true, customIconUrl: updated?.widget_custom_icon_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  const bot = await getOwnedBot(context);
  if (bot instanceof NextResponse) return bot;
  await updateBot(bot.id, { widget_custom_icon_url: null, widget_launcher_icon_type: "default" });
  await removeWidgetIcon(bot.widget_custom_icon_url, bot.id);
  return NextResponse.json({ ok: true });
}

async function getOwnedBot(context: Context) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await context.params).id);
  const bot = Number.isSafeInteger(id) && id > 0 ? await getBotById(id) : null;
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return bot;
}
