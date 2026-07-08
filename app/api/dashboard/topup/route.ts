import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createTopupOrder, listTopupOrders } from "@/lib/topup";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orders = await listTopupOrders(userId);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[topup:get]", error);
    return NextResponse.json({ error: "Unable to load top-up orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const amount = Number(body.amount);
    if (![50, 100, 300].includes(amount)) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }
    const order = await createTopupOrder({ userId, amount });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("[topup:post]", error);
    return NextResponse.json({ error: "Unable to create top-up order" }, { status: 500 });
  }
}
