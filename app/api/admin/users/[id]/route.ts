import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { updateUser, deleteUser, findUserById } from "@/lib/users";

function isDuplicateEmail(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY";
}

export async function PUT(req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const role = body.role === "ADMIN" ? "ADMIN" : body.role === "USER" ? "USER" : null;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "Valid role is required" }, { status: 400 });
  }
  if (id === admin.id && role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
  }
  if (!(await findUserById(id))) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const user = await updateUser(id, { email, fullName, role });
    return NextResponse.json({ user });
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext<"/api/admin/users/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }
  if (!(await findUserById(id))) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await deleteUser(id);
  return NextResponse.json({ ok: true });
}
