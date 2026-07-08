import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createTopupOrder, listTopupOrders } from "@/lib/topup";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await listTopupOrders(userId);
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const amount = Number(body.amount);
  if (![50, 100, 300].includes(amount)) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }
  const order = await createTopupOrder({ userId, amount });
  return NextResponse.json({ order });
}
