import { ai } from "@/lib/ai";
import { getFAQData, FAQ } from "@/lib/faq";
import { saveChatLog } from "@/lib/chat-log";

const FALLBACK_MESSAGE =
  "ขออภัย ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

// Error message returned by AI provider when it fails
const AI_ERROR_MESSAGE =
  "ขออภัย ระบบ AI ยังไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

/**
 * Search FAQ from MySQL database for matching question
 * @param question - User's question
 * @returns Matching FAQ entry or null if not found
 */
async function searchFAQ(question: string): Promise<FAQ | null> {
  try {
    const faqData = await getFAQData();
    const normalizedQuestion = normalizeText(question);

    let bestMatch: { faq: FAQ; score: number } | null = null;

    for (const faq of faqData) {
      const score = getFAQMatchScore(normalizedQuestion, normalizeText(faq.question));
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { faq, score };
      }
    }

    if (bestMatch && bestMatch.score >= 0.3) {
      return bestMatch.faq;
    }

    return null;
  } catch (error) {
    console.error("Error searching FAQ:", error);
    return null;
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFAQMatchScore(question: string, faqQuestion: string): number {
  if (!question || !faqQuestion) return 0;
  if (question === faqQuestion) return 1;
  if (question.includes(faqQuestion) || faqQuestion.includes(question)) return 0.9;

  const questionTokens = tokenize(question);
  const faqTokens = tokenize(faqQuestion);
  const tokenScore = jaccardSimilarity(questionTokens, faqTokens);
  const gramScore = jaccardSimilarity(getCharacterNGrams(question), getCharacterNGrams(faqQuestion));

  return Math.max(tokenScore, gramScore);
}

function tokenize(text: string): string[] {
  return text.split(" ").filter(Boolean);
}

function getCharacterNGrams(text: string, size = 3): string[] {
  const compact = text.replace(/\s+/g, "");
  if (compact.length <= size) {
    return compact ? [compact] : [];
  }

  const grams: string[] = [];
  for (let i = 0; i <= compact.length - size; i += 1) {
    grams.push(compact.slice(i, i + size));
  }
  return grams;
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;

  for (const item of setA) {
    if (setB.has(item)) {
      intersection += 1;
    }
  }

  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

interface GenerateAnswerOptions {
  userId?: string;
}

/**
 * Generate answer using the bot logic:
 * 1. Search FAQ from MySQL first
 * 2. If matching FAQ is found, return FAQ answer
 * 3. If no FAQ match, call AI provider (with automatic failover)
 * 4. If AI fails, return fallback message
 *
 * @param question - User's question
 * @param options - Optional settings (userId for chat logging)
 * @returns Object containing reply text and source
 */
export async function generateAnswer(
  question: string,
  options: GenerateAnswerOptions = {}
): Promise<{
  reply: string;
  source: "mysql_faq" | "ai" | "fallback";
}> {
  // Step 1: Search FAQ from MySQL
  const matchedFAQ = await searchFAQ(question);

  if (matchedFAQ) {
    // Save chat log
    if (options.userId) {
      saveChatLog({
        userId: options.userId,
        question,
        answer: matchedFAQ.answer,
        source: "mysql_faq",
      }).catch((err) => console.error("Failed to save chat log:", err));
    }

    return {
      reply: matchedFAQ.answer,
      source: "mysql_faq",
    };
  }

  // Step 2: No FAQ match, call AI provider
  try {
    const prompt = buildPrompt(question);
    const messages = [{ role: "user" as const, content: prompt }];
    const answer = await ai.chat(messages);

    // Check if the response is the AI error message
    if (answer === AI_ERROR_MESSAGE) {
       // AI provider failed, save with fallback source
       if (options.userId) {
         saveChatLog({
           userId: options.userId,
           question,
           answer: FALLBACK_MESSAGE,
           source: "fallback",
         }).catch((err) => console.error("Failed to save chat log:", err));
       }

      return {
        reply: FALLBACK_MESSAGE,
        source: "fallback",
      };
    }

    if (answer) {
       // Save chat log for successful AI response
       if (options.userId) {
         saveChatLog({
           userId: options.userId,
           question,
           answer,
           source: "ai",
         }).catch((err) => console.error("Failed to save chat log:", err));
       }

      return {
        reply: answer,
        source: "ai",
      };
    }

     // Save fallback chat log
     if (options.userId) {
       saveChatLog({
         userId: options.userId,
         question,
         answer: FALLBACK_MESSAGE,
         source: "fallback",
       }).catch((err) => console.error("Failed to save chat log:", err));
     }

    return {
      reply: FALLBACK_MESSAGE,
      source: "fallback",
    };
  } catch (error) {
    console.error("AI Provider Error:", error);

     // Save fallback chat log on error
     if (options.userId) {
       saveChatLog({
         userId: options.userId,
         question,
         answer: FALLBACK_MESSAGE,
         source: "fallback",
       }).catch((err) => console.error("Failed to save chat log:", err));
     }

    return {
      reply: FALLBACK_MESSAGE,
      source: "fallback",
    };
  }
}

/**
 * Build prompt for AI
 * @param question - User's question
 * @returns Formatted prompt string
 */
function buildPrompt(question: string): string {
  return `
คุณเป็นผู้ชายชื่อสัญญา เป็นผู้ช่วยที่ปรึกษาทางการเงินเบื้องต้น และผู้ช่วยด้านการไกล่เกลี่ยหนี้

บทบาทของคุณ:
- ช่วยอธิบายปัญหาหนี้ การเงิน การผ่อนชำระ และทางเลือกในการเจรจากับเจ้าหนี้
- ช่วยแนะนำแนวทางไกล่เกลี่ยอย่างเป็นกลาง ไม่เข้าข้างลูกหนี้หรือเจ้าหนี้
- ช่วยให้ผู้ใช้เข้าใจทางเลือก เช่น ขอผ่อนชำระ ขอปรับโครงสร้างหนี้ ขอเจรจาลดภาระ หรือเข้าสู่กระบวนการไกล่เกลี่ย
- หากเหมาะสม ให้แนะนำผู้ใช้ไปสมัครใช้งานระบบไกล่เกลี่ยออนไลน์ที่ https://ai-mediation.rattanan.dev

กฎการตอบ:
- ตอบเป็นภาษาไทย
- เคยคุยกันแล้วไม่ต้องสวัสดีทุกครั้ง
- ไม่ตอบยาวเกินไป ให้สั้นกระชับ เข้าใจง่าย
- น้ำเสียงเป็นมิตร เข้าใจง่าย ให้กำลังใจ แต่ไม่ขายฝัน
- ให้รับฟัง ถามคำถามกลับอย่างสนใจ และไม่ด่วนสรุป ให้แนะนำแนวทางทีละข้อ
- ตอบแบบคุยกับคนจริง ๆ ไม่เป็นทางการเกินไป
- ใช้อิโมจิได้เล็กน้อย แต่ไม่เยอะ
- ห้ามบอกว่าปัญหาหนี้จะหายแน่นอน
- ห้ามให้คำแนะนำที่เสี่ยงผิดกฎหมาย
- หากไม่ทราบ ให้ตอบว่าไม่ทราบ และแนะนำให้ปรึกษาผู้เชี่ยวชาญ
- หากเป็นเรื่องกฎหมายเฉพาะคดี ให้บอกว่าเป็นข้อมูลเบื้องต้น ไม่ใช่คำปรึกษากฎหมายอย่างเป็นทางการ
- หากผู้ใช้มีหนี้ ค้างชำระ ถูกทวงหนี้ กำลังจะถูกฟ้อง หรืออยากเจรจากับเจ้าหนี้ ให้แนะนำให้เข้าสู่ระบบ ai-mediation.rattanan.dev เพื่อให้ระบบช่วยรวบรวมข้อมูลและเข้าสู่กระบวนการไกล่เกลี่ย

แนวทางการชวนใช้ระบบ:
- ชวนแบบสุภาพ ไม่ยัดเยียด
- อธิบายประโยชน์สั้น ๆ เช่น ระบบช่วยเตรียมข้อมูล นัดหมายผู้ไกล่เกลี่ย และช่วยหาทางออกที่เป็นธรรม
- ใส่ลิงก์นี้เท่านั้น: https://ai-mediation.rattanan.dev
คำถาม:
${question}
`;
}
