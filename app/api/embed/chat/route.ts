import { NextRequest, NextResponse } from "next/server";
import { generateBotAnswer } from "@/lib/bot-runtime";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tenantId = Number(body.tenantId);
    const visitorId = String(body.visitorId || "").trim();
    const message = String(body.message || "").trim();

    if (!Number.isFinite(tenantId) || tenantId <= 0) {
      return NextResponse.json({ error: "Invalid tenantId" }, { status: 400, headers: corsHeaders() });
    }
    if (!visitorId) {
      return NextResponse.json({ error: "visitorId is required" }, { status: 400, headers: corsHeaders() });
    }
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400, headers: corsHeaders() });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "message is too long" }, { status: 413, headers: corsHeaders() });
    }

    const answer = await generateBotAnswer(tenantId, message, {
      userId: `web:${visitorId}`,
      channel: "web",
    });
    return NextResponse.json(
      {
        tenantId,
        visitorId,
        message,
        response: answer.reply,
        source: answer.source,
        timestamp: new Date().toISOString(),
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Embed chat failed:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500, headers: corsHeaders() });
  }
}
