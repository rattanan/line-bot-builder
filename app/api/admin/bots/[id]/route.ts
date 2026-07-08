import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { addBotCredits, setBotStatus } from "@/lib/bot-usage";
import { getAdminBotDetail } from "@/lib/admin";

export async function GET(_req: NextRequest, context: RouteContext<"/api/admin/bots/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const botId = Number((await context.params).id);
  const detail = await getAdminBotDetail(botId);
  if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function POST(req: NextRequest, context: RouteContext<"/api/admin/bots/[id]">) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const botId = Number((await context.params).id);
  const body = await req.json();
  const action = String(body.action || "");

  if (action === "suspend" || action === "activate") {
    await setBotStatus(botId, action === "suspend" ? "suspended" : "active");
    return NextResponse.json({ ok: true });
  }

  if (action === "credit") {
    const amount = Number(body.amount || 0);
    const reason = String(body.reason || "admin top up");
    const result = await addBotCredits({
      botId,
      amount,
      reason,
      adminEmail: admin.email,
    });
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
