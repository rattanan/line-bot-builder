import { NextRequest, NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/lib/users";
import { getSessionUserId } from "@/lib/auth";

export async function PUT(req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const sessionUser = await getSessionUserId();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  const body = await req.json();

  const user = await updateUser(id, {
    fullName: body.fullName ? String(body.fullName) : undefined,
    password: body.password ? String(body.password) : undefined,
    role: body.role === "staff" ? "staff" : body.role === "admin" ? "admin" : undefined,
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const sessionUser = await getSessionUserId();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
