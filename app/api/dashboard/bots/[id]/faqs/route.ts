import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { addFAQ, getFAQData, searchFAQsByBot } from "@/lib/faq";

export async function GET(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/faqs">) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const search = req.nextUrl.searchParams.get("search") || "";
  const faqs = search.trim() ? await searchFAQsByBot(botId, search.trim()) : await getFAQData(botId);
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/faqs">) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const question = String(body.question || "").trim();
  const answer = String(body.answer || "").trim();
  if (!question || !answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  }

  const faq = await addFAQ(botId, question, answer);
  return NextResponse.json(faq, { status: 201 });
}
