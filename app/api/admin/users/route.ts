import { NextRequest, NextResponse } from "next/server";
import { createUser, ensureSeedAdminUser, getUsers } from "@/lib/users";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getSessionUserId();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureSeedAdminUser();
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUserId();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const username = String(body.username || "").trim();
  const fullName = String(body.fullName || "").trim();
  const password = String(body.password || "").trim();
  const role = body.role === "staff" ? "staff" : "admin";

  if (!username || !fullName || !password) {
    return NextResponse.json({ error: "username, fullName and password are required" }, { status: 400 });
  }

  const user = await createUser({ username, fullName, password, role });
  return NextResponse.json(user, { status: 201 });
}
