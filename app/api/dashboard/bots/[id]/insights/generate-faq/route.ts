import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { generateSuggestedFAQ } from "@/lib/business-insight";
import { getBotById } from "@/lib/bots";
import { addDraftFAQ, getFAQData } from "@/lib/faq";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  const botId = Number((await context.params).id);
  if (!userId || !Number.isInteger(botId) || botId <= 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bot = await getBotById(botId);
  if (!bot || bot.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const question = String(body.question || "").trim();
  if (!question || question.length > 500) {
    return NextResponse.json({ error: "A valid question is required" }, { status: 400 });
  }

  try {
    const faqs = await getFAQData(botId);
    const duplicate = faqs.some(
      (faq) => faq.question.trim().toLocaleLowerCase() === question.toLocaleLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({ error: "This FAQ already exists" }, { status: 409 });
    }

    const generated = await generateSuggestedFAQ(bot, question, faqs);
    const faq = await addDraftFAQ({ botId, ...generated });
    if (!faq) throw new Error("Failed to save generated FAQ");

    return NextResponse.json(
      { faq, category: generated.category, message: "FAQ saved as draft" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to generate draft FAQ:", error);
    return NextResponse.json(
      { error: "AI could not generate this FAQ. Please try again." },
      { status: 502 }
    );
  }
}
