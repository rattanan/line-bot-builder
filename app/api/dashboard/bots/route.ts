import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { createBotWithFaqs, getBotsByUserId } from "@/lib/bots";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getBotsByUserId(userId));
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const botName = String(body.botName || "").trim();
  const businessName = String(body.businessName || "").trim();
  const businessDescription = String(body.businessDescription || "").trim();
  const systemPrompt = String(body.systemPrompt || "").trim();
  const lineChannelSecret = String(body.lineChannelSecret || "").trim();
  const lineChannelAccessToken = String(body.lineChannelAccessToken || "").trim();
  const faqs = Array.isArray(body.faqs) ? body.faqs : [];

  if (!botName || !businessName || !businessDescription || !systemPrompt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const bot = await createBotWithFaqs({
    userId,
    botName,
    businessName,
    businessDescription,
    systemPrompt,
    lineChannelSecret,
    lineChannelAccessToken,
    faqs: faqs.map((faq: { question: string; answer: string }) => ({
      question: String(faq.question || "").trim(),
      answer: String(faq.answer || "").trim(),
    })).filter((faq: { question: string; answer: string }) => faq.question && faq.answer),
  });

  return NextResponse.json(bot, { status: 201 });
}
