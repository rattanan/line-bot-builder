import { promises as fs } from "fs";
import path from "path";
import { openAICompatibleChat } from "./ai/openai-compatible";

type ImageFaq = {
  question: string;
  answer: string;
  category: string;
  confidenceScore: number;
  sourceType: "image";
  languageCode: string;
};

async function toDataUrl(file: { url: string; type: string }) {
  if (!file.url.startsWith("/uploads/")) return null;
  const localPath = path.join(process.cwd(), "public", file.url);
  const bytes = await fs.readFile(localPath);
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

function fallbackFaq(file: { url: string; type: string }, reason = "ระบบยังอ่านรายละเอียดจากภาพไม่ได้") {
  return {
    sourceRef: file.url,
    extractedText: "",
    extractedFaqs: [
      {
        question: "รูปภาพนี้เกี่ยวกับอะไร?",
        answer: `${reason} กรุณาตรวจสอบภาพต้นฉบับ: ${file.url}`,
        category: "image",
        confidenceScore: 0.35,
        sourceType: "image" as const,
        languageCode: "th",
      },
    ],
  };
}

async function analyzeOneImage(file: { url: string; type: string }) {
  try {
    const dataUrl = await toDataUrl(file);
    if (!dataUrl) return fallbackFaq(file);

    const { content } = await openAICompatibleChat(
      [
        {
          role: "system",
          content:
            "You analyze business images and OCR visible text. Return strict JSON only. Generate customer-facing FAQ drafts in Thai.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                'Analyze this image. Extract products, services, prices, opening hours, contacts, brand names, promotions, menus, and OCR text. Return JSON: {"extractedText":"string","faqs":[{"question":"string","answer":"string","category":"string","confidenceScore":0.0,"languageCode":"th"}]}',
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      { temperature: 0.1, maxTokens: 1800, timeoutMs: 60000 }
    );
    const parsed = JSON.parse(content) as {
      extractedText?: string;
      faqs?: Array<Partial<ImageFaq>>;
    };
    const faqs = (parsed.faqs || [])
      .filter((faq) => faq.question && faq.answer)
      .slice(0, 12)
      .map((faq) => ({
        question: String(faq.question),
        answer: String(faq.answer),
        category: String(faq.category || "image"),
        confidenceScore: Number(faq.confidenceScore || 0.7),
        sourceType: "image" as const,
        languageCode: String(faq.languageCode || "th"),
      }));
    return {
      sourceRef: file.url,
      extractedText: String(parsed.extractedText || ""),
      extractedFaqs: faqs.length ? faqs : fallbackFaq(file, "ไม่พบข้อความชัดเจนในภาพ").extractedFaqs,
    };
  } catch (error) {
    console.error("Vision extraction failed:", error);
    return fallbackFaq(file);
  }
}

export async function extractKnowledgeFromImages(files: Array<{ url: string; type: string }>) {
  return {
    items: await Promise.all(files.map((file) => analyzeOneImage(file))),
  };
}
