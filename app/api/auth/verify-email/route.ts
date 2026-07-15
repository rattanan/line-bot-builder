import { NextRequest, NextResponse } from "next/server";
import { consumeToken, updateUser } from "@/lib/users";
import { getAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(getAppUrl(req, "/login?verified=0"));

  const userId = await consumeToken("email_verify", token);
  if (!userId) return NextResponse.redirect(getAppUrl(req, "/login?verified=0"));

  await updateUser(userId, { emailVerifiedAt: new Date().toISOString() });
  return NextResponse.redirect(getAppUrl(req, "/login?verified=1"));
}
