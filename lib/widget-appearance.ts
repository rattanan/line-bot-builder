export const DEFAULT_WIDGET_APPEARANCE = {
  primaryColor: "#2563EB",
  launcherIconType: "default" as const,
  defaultIcon: "chat" as const,
  launcherShape: "circle" as const,
  launcherPosition: "right" as const,
  horizontalOffset: 20,
  bottomOffset: 20,
  showDismissButton: false,
};

export const WIDGET_OFFSET_MIN = 0;
export const WIDGET_OFFSET_MAX = 200;

export const WIDGET_DEFAULT_ICONS = [
  "chat",
  "robot",
  "support",
  "shopping_bag",
  "store",
  "line_message",
] as const;

export type WidgetDefaultIcon = (typeof WIDGET_DEFAULT_ICONS)[number];
export type WidgetLauncherIconType = "default" | "bot_profile" | "custom";
export type WidgetLauncherShape = "circle" | "rounded";
export type WidgetLauncherPosition = "left" | "right";

export type WidgetAppearance = {
  primaryColor: string;
  launcherIconType: WidgetLauncherIconType;
  defaultIcon?: WidgetDefaultIcon;
  customIconUrl?: string;
  launcherShape: WidgetLauncherShape;
  launcherPosition: WidgetLauncherPosition;
  horizontalOffset: number;
  bottomOffset: number;
  showDismissButton: boolean;
};

export function normalizeHexColor(value: unknown): string | null {
  const color = String(value ?? "").trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(color)) return null;
  return color;
}

export function getContrastingTextColor(hex: string): "#FFFFFF" | "#000000" {
  const color = normalizeHexColor(hex) ?? DEFAULT_WIDGET_APPEARANCE.primaryColor;
  const channels = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? "#FFFFFF" : "#000000";
}

export function isWidgetDefaultIcon(value: unknown): value is WidgetDefaultIcon {
  return WIDGET_DEFAULT_ICONS.includes(value as WidgetDefaultIcon);
}

export function isWidgetIconType(value: unknown): value is WidgetLauncherIconType {
  return value === "default" || value === "bot_profile" || value === "custom";
}

export function isWidgetShape(value: unknown): value is WidgetLauncherShape {
  return value === "circle" || value === "rounded";
}

export function isWidgetPosition(value: unknown): value is WidgetLauncherPosition {
  return value === "left" || value === "right";
}

export function normalizeWidgetOffset(value: unknown): number | null {
  const offset = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(offset) || offset < WIDGET_OFFSET_MIN || offset > WIDGET_OFFSET_MAX) return null;
  return offset;
}
