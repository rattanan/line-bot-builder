import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { extractKnowledgeFromImages } from "@/lib/vision-extractor";
import { addKnowledgeCandidates, updateWizardStatus } from "@/lib/bot-knowledge-wizard";
import { storeKnowledgeWizardImage } from "@/lib/knowledge-wizard-storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const wizardId = Number(formData.get("wizardId") || 0);
  if (!wizardId) return NextResponse.json({ error: "Missing wizardId" }, { status: 400 });

  const files = formData.getAll("images").filter((item): item is File => item instanceof File);

  if (!files.length) return NextResponse.json({ error: "No images uploaded" }, { status: 400 });

  const stored = await Promise.all(files.map((file) => storeKnowledgeWizardImage(file, bot.id, wizardId)));
  void (async () => {
    try {
      await updateWizardStatus(wizardId, "extracting_images");
      const result = await extractKnowledgeFromImages(stored.map((file) => ({ url: file.url, type: file.type })));
      await addKnowledgeCandidates(
        wizardId,
        bot.id,
        result.items.flatMap((item) =>
          item.extractedFaqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            confidenceScore: faq.confidenceScore,
            sourceType: faq.sourceType,
            languageCode: faq.languageCode,
            sourceRef: item.sourceRef,
          }))
        )
      );
      await updateWizardStatus(wizardId, "ready_for_review");
    } catch (error) {
      console.error("Knowledge wizard image extraction failed:", error);
    }
  })();

  return NextResponse.json({ ok: true, uploaded: stored.length }, { status: 202 });
}
