import { NextRequest, NextResponse } from "next/server";
import { consumeToken, updateUser } from "@/lib/users";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?verified=0", req.url));

  const userId = await consumeToken("email_verify", token);
  if (!userId) return NextResponse.redirect(new URL("/login?verified=0", req.url));

  await updateUser(userId, { emailVerifiedAt: new Date().toISOString() });
  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
