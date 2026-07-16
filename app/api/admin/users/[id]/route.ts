import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { updateUser, deleteUser, findUserById, setUserCreditBalance } from "@/lib/users";

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
  const creditBalance = Number(body.creditBalance);
  const creditReason = String(body.creditReason || "").trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "Valid role is required" }, { status: 400 });
  }
  if (!Number.isSafeInteger(creditBalance) || creditBalance < 0 || creditBalance > 1_000_000_000) {
    return NextResponse.json({ error: "Credit must be a whole number between 0 and 1,000,000,000" }, { status: 400 });
  }
  if (!creditReason) {
    return NextResponse.json({ error: "Credit adjustment reason is required" }, { status: 400 });
  }
  if (id === admin.id && role !== "ADMIN") {
    return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
  }
  if (!(await findUserById(id))) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const user = await updateUser(id, { email, fullName, role });
    const credit = await setUserCreditBalance({
      userId: id,
      balance: creditBalance,
      reason: creditReason,
      adminEmail: admin.email,
    });
    return NextResponse.json({
      user: {
        ...user,
        credit_balance: credit?.creditBalance ?? creditBalance,
      },
    });
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
