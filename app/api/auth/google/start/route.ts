import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const state = createToken();

  const redirectUri = new URL("/api/auth/google/callback", req.url);
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "");
  authUrl.searchParams.set("redirect_uri", redirectUri.toString());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("llb_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
