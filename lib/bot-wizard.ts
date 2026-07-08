import { openAICompatibleChat } from "./ai/openai-compatible";

export type WizardInput = {
  storeName: string;
  storeDescription: string;
  services: string;
  openingHours: string;
  contactChannels: string;
  tone: string;
};

export type WizardOutput = {
  systemPrompt: string;
  faqs: Array<{ question: string; answer: string }>;
  profileImagePrompt: string;
  bannerImagePrompt: string;
};

const FALLBACK: WizardOutput = {
  systemPrompt: "You are a helpful assistant for the business. Reply clearly, politely, and accurately.",
  faqs: [
    { question: "ร้านเปิดกี่โมง?", answer: "กรุณาตรวจสอบเวลาเปิดปิดจากข้อมูลร้านล่าสุด" },
    { question: "ติดต่อร้านได้ทางไหน?", answer: "กรุณาดูช่องทางติดต่อที่ร้านแจ้งไว้" },
    { question: "มีบริการอะไรบ้าง?", answer: "ร้านมีบริการตามที่ระบุในข้อมูลของร้าน" },
  ],
  profileImagePrompt: "A clean professional profile image for a modern business.",
  bannerImagePrompt: "A polished banner image for a modern business with brand-friendly colors.",
};

function buildPrompt(input: WizardInput) {
  return `You are an expert AI bot architect.
Create a complete onboarding package for a LINE chatbot business.

Business info:
- Store/Organization name: ${input.storeName}
- Description: ${input.storeDescription}
- Services/Products: ${input.services}
- Opening hours: ${input.openingHours}
- Contact channels: ${input.contactChannels}
- Tone: ${input.tone}

Return ONLY valid JSON with this exact shape:
{
  "systemPrompt": "string",
  "faqs": [{"question":"string","answer":"string"}],
  "profileImagePrompt": "string",
  "bannerImagePrompt": "string"
}

Requirements:
- Generate 10 to 20 FAQs.
- FAQs must be relevant and not duplicate each other.
- systemPrompt should define persona, style, boundaries, and response behavior.
- profileImagePrompt should describe a square avatar suitable for a business profile.
- bannerImagePrompt should describe a wide banner/header image.
- Use the requested tone consistently.
- Avoid markdown fences.`;
}

export async function generateWizardContent(input: WizardInput): Promise<WizardOutput> {
  try {
    const { content } = await openAICompatibleChat(
      [
        { role: "system", content: "You output strict JSON only." },
        { role: "user", content: buildPrompt(input) },
      ],
      { temperature: 0.4, maxTokens: 2500 }
    );

    const parsed = JSON.parse(content) as WizardOutput;
    if (!parsed.systemPrompt || !Array.isArray(parsed.faqs) || !parsed.profileImagePrompt || !parsed.bannerImagePrompt) {
      throw new Error("Invalid wizard response shape");
    }

    const faqs = parsed.faqs.slice(0, 20).filter((faq) => faq.question && faq.answer);
    return {
      systemPrompt: parsed.systemPrompt,
      faqs: faqs.length ? faqs : FALLBACK.faqs,
      profileImagePrompt: parsed.profileImagePrompt,
      bannerImagePrompt: parsed.bannerImagePrompt,
    };
  } catch (error) {
    console.error("Wizard generation failed:", error);
    return FALLBACK;
  }
}
