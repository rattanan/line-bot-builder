import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { verifyUserCredentials } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    const user = await verifyUserCredentials(String(email), String(password));
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
    }

    const sessionToken = await createSession(user.id);
    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
