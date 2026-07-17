import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById, updateBot } from "@/lib/bots";
import {
  DEFAULT_WIDGET_APPEARANCE,
  isWidgetDefaultIcon,
  isWidgetIconType,
  isWidgetPosition,
  isWidgetShape,
  normalizeHexColor,
  normalizeWidgetOffset,
} from "@/lib/widget-appearance";
import { removeWidgetIcon } from "@/lib/widget-icon-storage";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Context) {
  const ownedBot = await getOwnedBot(context);
  if (ownedBot instanceof NextResponse) return ownedBot;
  return NextResponse.json({ widget: widgetSettingsDto(ownedBot) });
}

export async function PATCH(req: NextRequest, context: Context) {
  const ownedBot = await getOwnedBot(context);
  if (ownedBot instanceof NextResponse) return ownedBot;
  const body = await req.json().catch(() => ({}));

  if (body.reset === true) {
    const previousCustomIconUrl = ownedBot.widget_custom_icon_url;
    const updated = await updateBot(ownedBot.id, {
      widget_primary_color: DEFAULT_WIDGET_APPEARANCE.primaryColor,
      widget_launcher_icon_type: DEFAULT_WIDGET_APPEARANCE.launcherIconType,
      widget_default_icon: DEFAULT_WIDGET_APPEARANCE.defaultIcon,
      widget_custom_icon_url: null,
      widget_launcher_shape: DEFAULT_WIDGET_APPEARANCE.launcherShape,
      widget_launcher_position: DEFAULT_WIDGET_APPEARANCE.launcherPosition,
      widget_horizontal_offset: DEFAULT_WIDGET_APPEARANCE.horizontalOffset,
      widget_bottom_offset: DEFAULT_WIDGET_APPEARANCE.bottomOffset,
      widget_show_dismiss_button: DEFAULT_WIDGET_APPEARANCE.showDismissButton ? 1 : 0,
    });
    await removeWidgetIcon(previousCustomIconUrl, ownedBot.id);
    return NextResponse.json({ ok: true, widget: widgetSettingsDto(updated!) });
  }

  const primaryColor = normalizeHexColor(body.primaryColor);
  if (!primaryColor) return NextResponse.json({ error: "Primary color must be a 6-digit HEX value" }, { status: 400 });
  if (!isWidgetIconType(body.launcherIconType)) return NextResponse.json({ error: "Invalid launcher icon type" }, { status: 400 });
  if (!isWidgetDefaultIcon(body.defaultIcon)) return NextResponse.json({ error: "Invalid default icon" }, { status: 400 });
  if (!isWidgetShape(body.launcherShape)) return NextResponse.json({ error: "Invalid launcher shape" }, { status: 400 });
  if (!isWidgetPosition(body.launcherPosition)) return NextResponse.json({ error: "Invalid launcher position" }, { status: 400 });
  const horizontalOffset = normalizeWidgetOffset(body.horizontalOffset);
  const bottomOffset = normalizeWidgetOffset(body.bottomOffset);
  if (horizontalOffset === null || bottomOffset === null) {
    return NextResponse.json({ error: "Widget offsets must be whole numbers from 0 to 200" }, { status: 400 });
  }
  if (typeof body.showDismissButton !== "boolean") {
    return NextResponse.json({ error: "Invalid dismiss button setting" }, { status: 400 });
  }
  if (body.launcherIconType === "bot_profile" && !ownedBot.bot_profile_image_url) {
    return NextResponse.json({ error: "This bot does not have a profile image" }, { status: 400 });
  }
  if (body.launcherIconType === "custom" && !ownedBot.widget_custom_icon_url) {
    return NextResponse.json({ error: "Upload a custom icon before selecting it" }, { status: 400 });
  }

  const updated = await updateBot(ownedBot.id, {
    widget_primary_color: primaryColor,
    widget_launcher_icon_type: body.launcherIconType,
    widget_default_icon: body.defaultIcon,
    widget_launcher_shape: body.launcherShape,
    widget_launcher_position: body.launcherPosition,
    widget_horizontal_offset: horizontalOffset,
    widget_bottom_offset: bottomOffset,
    widget_show_dismiss_button: body.showDismissButton ? 1 : 0,
  });
  return NextResponse.json({ ok: true, widget: widgetSettingsDto(updated!) });
}

async function getOwnedBot(context: Context) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const bot = await getBotById(id);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return bot;
}

function widgetSettingsDto(bot: NonNullable<Awaited<ReturnType<typeof getBotById>>>) {
  return {
    botName: bot.bot_name,
    botProfileImageUrl: bot.bot_profile_image_url,
    primaryColor: normalizeHexColor(bot.widget_primary_color) ?? DEFAULT_WIDGET_APPEARANCE.primaryColor,
    launcherIconType: isWidgetIconType(bot.widget_launcher_icon_type) ? bot.widget_launcher_icon_type : "default",
    defaultIcon: isWidgetDefaultIcon(bot.widget_default_icon) ? bot.widget_default_icon : "chat",
    customIconUrl: bot.widget_custom_icon_url,
    launcherShape: isWidgetShape(bot.widget_launcher_shape) ? bot.widget_launcher_shape : "circle",
    launcherPosition: isWidgetPosition(bot.widget_launcher_position) ? bot.widget_launcher_position : DEFAULT_WIDGET_APPEARANCE.launcherPosition,
    horizontalOffset: normalizeWidgetOffset(bot.widget_horizontal_offset) ?? DEFAULT_WIDGET_APPEARANCE.horizontalOffset,
    bottomOffset: normalizeWidgetOffset(bot.widget_bottom_offset) ?? DEFAULT_WIDGET_APPEARANCE.bottomOffset,
    showDismissButton: bot.widget_show_dismiss_button === 1,
    publicToken: bot.widget_public_token,
  };
}
