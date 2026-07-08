import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getAdminUsers } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getAdminUsers());
}
