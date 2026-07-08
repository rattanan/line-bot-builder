import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { verifyUserCredentials, ensureSeedAdminUser } from "@/lib/users";

export async function POST(req: NextRequest) {
  try {
    await ensureSeedAdminUser();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "username and password are required" }, { status: 400 });
    }

    const user = await verifyUserCredentials(String(username), String(password));
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    response.cookies.set("llb_session", createSessionToken(), {
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
