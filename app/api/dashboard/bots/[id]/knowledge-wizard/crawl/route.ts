import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { crawlWebsiteForKnowledgeBackground } from "@/lib/website-scraper";
import { addKnowledgeCandidates, updateWizardStatus } from "@/lib/bot-knowledge-wizard";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const wizardId = Number(body.wizardId || 0);
  const url = String(body.websiteUrl || "").trim();
  if (!wizardId || !url) return NextResponse.json({ error: "Missing wizardId or websiteUrl" }, { status: 400 });

  void (async () => {
    try {
      await updateWizardStatus(wizardId, "scraping");
      const result = await crawlWebsiteForKnowledgeBackground({ url, maxDepth: 2, maxPages: 30 });
      await addKnowledgeCandidates(
        wizardId,
        bot.id,
        result.extractedFaqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          confidenceScore: faq.confidenceScore,
          sourceType: faq.sourceType,
          languageCode: faq.languageCode,
          sourceRef: url,
        }))
      );
      await updateWizardStatus(wizardId, "ready_for_review");
    } catch (error) {
      console.error("Knowledge wizard crawl failed:", error);
    }
  })();

  return NextResponse.json({ ok: true }, { status: 202 });
}
