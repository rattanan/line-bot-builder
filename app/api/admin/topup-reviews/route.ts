import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { listTopupReviews } from "@/lib/topup";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviews = await listTopupReviews();
  return NextResponse.json({ reviews });
}
