import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { updateUser, deleteUser } from "@/lib/users";

export async function PUT(req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  const body = await req.json();
  const user = await updateUser(id, {
    fullName: body.fullName ? String(body.fullName) : undefined,
    role: body.role === "ADMIN" ? "ADMIN" : body.role === "USER" ? "USER" : undefined,
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
