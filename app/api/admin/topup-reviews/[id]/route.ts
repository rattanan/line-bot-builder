import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { adminReviewTopup } from "@/lib/topup";

export async function POST(req: NextRequest, context: RouteContext<"/api/admin/topup-reviews/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orderId = Number((await context.params).id);
  const body = await req.json();
  const action = String(body.action || "");
  if (action === "approve") {
    const order = await adminReviewTopup(orderId, true);
    return NextResponse.json({ order });
  }
  if (action === "reject") {
    const order = await adminReviewTopup(orderId, false, String(body.reason || "Rejected by admin"));
    return NextResponse.json({ order });
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
