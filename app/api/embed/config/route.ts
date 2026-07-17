import { NextRequest, NextResponse } from "next/server";
import { getPublicWidgetConfigByBotId, getPublicWidgetConfigByToken } from "@/lib/widget-config";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const botId = Number(req.nextUrl.searchParams.get("botId"));
  const origin = req.nextUrl.origin;
  const config = token
    ? await getPublicWidgetConfigByToken(token, origin)
    : await getPublicWidgetConfigByBotId(botId, origin);
  if (!config) return NextResponse.json({ error: "Widget not found" }, { status: 404, headers: CORS_HEADERS });
  return NextResponse.json(config, { headers: CORS_HEADERS });
}
