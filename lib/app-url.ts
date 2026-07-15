import type { NextRequest } from "next/server";

export function getAppUrl(req: NextRequest, path: string): URL {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    return new URL(path, configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
  }

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedHost) {
    return new URL(path, `${forwardedProto || "https"}://${forwardedHost}`);
  }

  return new URL(path, req.url);
}
