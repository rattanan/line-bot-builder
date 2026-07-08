import { NextRequest, NextResponse } from "next/server";
import { createGoogleUser, findUserByGoogleSub } from "@/lib/users";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("llb_oauth_state")?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/login?google=0", req.url));
  }

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return NextResponse.redirect(new URL("/login?google=0", req.url));
  const tokenData = await tokenRes.json();
  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileRes.ok) return NextResponse.redirect(new URL("/login?google=0", req.url));
  const profile = await profileRes.json();

  let user = await findUserByGoogleSub(profile.sub);
  if (!user) {
    user = await createGoogleUser({
      email: profile.email,
      fullName: profile.name || profile.email,
      googleSub: profile.sub,
      emailVerifiedAt: profile.verified_email ? new Date().toISOString() : null,
    }) as NonNullable<typeof user>;
  }
  if (!user) return NextResponse.redirect(new URL("/login?google=0", req.url));

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  const session = await createSession(user.id);
  response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
  response.cookies.set("llb_oauth_state", "", { maxAge: 0, path: "/" });
  return response;
}
