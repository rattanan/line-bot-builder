import "server-only";

import { executeQuery } from "./mysql";
import {
  DEFAULT_WIDGET_APPEARANCE,
  getContrastingTextColor,
  isWidgetDefaultIcon,
  isWidgetIconType,
  isWidgetShape,
  normalizeHexColor,
  type WidgetAppearance,
} from "./widget-appearance";

type WidgetConfigRow = {
  id: number;
  bot_name: string;
  status: "active" | "suspended";
  bot_profile_image_url: string | null;
  widget_primary_color: string;
  widget_launcher_icon_type: string;
  widget_default_icon: string;
  widget_custom_icon_url: string | null;
  widget_launcher_shape: string;
};

export type PublicWidgetConfig = WidgetAppearance & {
  botName: string;
  launcherIconUrl?: string;
  foregroundColor: "#FFFFFF" | "#000000";
};

export async function getWidgetBotIdByToken(token: string): Promise<number | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const result = await executeQuery<{ id: number }>(
    "SELECT id FROM bots WHERE widget_public_token = ? AND status = 'active' LIMIT 1",
    [token]
  );
  return result.rows[0]?.id ?? null;
}

export async function getPublicWidgetConfigByToken(token: string, origin: string): Promise<PublicWidgetConfig | null> {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const result = await executeQuery<WidgetConfigRow>(
    `SELECT id, bot_name, status, bot_profile_image_url, widget_primary_color,
            widget_launcher_icon_type, widget_default_icon, widget_custom_icon_url, widget_launcher_shape
     FROM bots
     WHERE widget_public_token = ? AND status = 'active'
     LIMIT 1`,
    [token]
  );
  return result.rows[0] ? toPublicWidgetConfig(result.rows[0], origin) : null;
}

export async function getPublicWidgetConfigByBotId(botId: number, origin: string): Promise<PublicWidgetConfig | null> {
  if (!Number.isSafeInteger(botId) || botId <= 0) return null;
  const result = await executeQuery<WidgetConfigRow>(
    `SELECT id, bot_name, status, bot_profile_image_url, widget_primary_color,
            widget_launcher_icon_type, widget_default_icon, widget_custom_icon_url, widget_launcher_shape
     FROM bots
     WHERE id = ? AND status = 'active'
     LIMIT 1`,
    [botId]
  );
  return result.rows[0] ? toPublicWidgetConfig(result.rows[0], origin) : null;
}

export function isAllowedWidgetImageUrl(value: string | null | undefined, origin: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value, origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const originUrl = new URL(origin);
    if (url.origin === originUrl.origin && url.pathname.startsWith("/uploads/widget-icons/")) return true;
    if (url.origin === originUrl.origin && url.pathname.startsWith("/uploads/bot-profiles/")) return true;
    if (url.hostname.toLowerCase() === "profile.line-scdn.net" || url.hostname.toLowerCase().endsWith(".profile.line-scdn.net")) return true;
    const allowedHosts = String(process.env.WIDGET_ALLOWED_IMAGE_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    return allowedHosts.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function toPublicWidgetConfig(row: WidgetConfigRow, origin: string): PublicWidgetConfig {
  const primaryColor = normalizeHexColor(row.widget_primary_color) ?? DEFAULT_WIDGET_APPEARANCE.primaryColor;
  const defaultIcon = isWidgetDefaultIcon(row.widget_default_icon)
    ? row.widget_default_icon
    : DEFAULT_WIDGET_APPEARANCE.defaultIcon;
  const launcherShape = isWidgetShape(row.widget_launcher_shape)
    ? row.widget_launcher_shape
    : DEFAULT_WIDGET_APPEARANCE.launcherShape;
  let launcherIconType = isWidgetIconType(row.widget_launcher_icon_type)
    ? row.widget_launcher_icon_type
    : DEFAULT_WIDGET_APPEARANCE.launcherIconType;
  const selectedUrl = launcherIconType === "bot_profile" ? row.bot_profile_image_url : row.widget_custom_icon_url;
  const launcherIconUrl = isAllowedWidgetImageUrl(selectedUrl, origin)
    ? new URL(selectedUrl!, origin).toString()
    : undefined;
  if (launcherIconType !== "default" && !launcherIconUrl) launcherIconType = "default";

  return {
    botName: String(row.bot_name || "AI Assistant").slice(0, 150),
    primaryColor,
    foregroundColor: getContrastingTextColor(primaryColor),
    launcherIconType,
    defaultIcon,
    launcherIconUrl,
    launcherShape,
  };
}
