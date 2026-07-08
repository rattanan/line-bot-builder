import { NextRequest, NextResponse } from "next/server";
import { consumeToken, updateUser } from "@/lib/users";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "token and password are required" }, { status: 400 });
  }
  const userId = await consumeToken("password_reset", String(token));
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  await updateUser(userId, { password: String(password) });
  return NextResponse.json({ ok: true });
}
