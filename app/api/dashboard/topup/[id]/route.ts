import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getTopupOrderById } from "@/lib/topup";

export async function GET(_req: Request, context: RouteContext<"/api/dashboard/topup/[id]">) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orderId = Number((await context.params).id);
  const order = await getTopupOrderById(orderId, userId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}
