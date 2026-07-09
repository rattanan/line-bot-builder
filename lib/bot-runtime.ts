import { getBotById } from "@/lib/bots";
import { getFAQData, FAQ } from "@/lib/faq";
import { recordBotUsage, consumeBotCredit } from "@/lib/bot-usage";
import { saveChatLog } from "@/lib/chat-log";
import { openAICompatibleChat } from "@/lib/ai/openai-compatible";

const FALLBACK_MESSAGE =
  "ขออภัย ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

const AI_ERROR_MESSAGE =
  "ขออภัย ระบบ AI ยังไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
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

async function searchFAQ(botId: number, question: string): Promise<FAQ | null> {
  try {
    const faqData = (await getFAQData(botId)).filter((faq) => faq.is_active === 1 && faq.faq_status !== "draft" && faq.faq_status !== "archived");
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

function buildPrompt(bot: {
  bot_name: string;
  business_name: string;
  business_description: string;
  system_prompt: string;
}, question: string): string {
  return `
${bot.system_prompt}

Business name: ${bot.business_name}
Bot name: ${bot.bot_name}
Business description: ${bot.business_description}

User question:
${question}
`;
}

export async function generateBotAnswer(
  botId: number,
  question: string,
  options: { userId?: string } = {}
): Promise<{
  reply: string;
  source: "mysql_faq" | "ai" | "fallback";
}> {
  const bot = await getBotById(botId);
  if (!bot) {
    return { reply: FALLBACK_MESSAGE, source: "fallback" };
  }
  if (bot.status !== "active") {
    return { reply: "บอทนี้ถูกระงับการใช้งานอยู่ในขณะนี้", source: "fallback" };
  }

  const credit = await consumeBotCredit({
    botId,
    lineUserId: options.userId || "unknown",
    userMessage: question,
  });
  if (!credit.ok) {
    const blockedReply =
      credit.reason === "insufficient"
        ? "เครดิตหมด กรุณาติดต่อผู้ดูแลระบบ"
        : credit.reason === "suspended"
          ? "บอทนี้ถูกระงับการใช้งานอยู่ในขณะนี้"
          : FALLBACK_MESSAGE;
    if (options.userId) {
      saveChatLog({
        userId: options.userId,
        botId,
        question,
        answer: blockedReply,
        source: "fallback",
      }).catch((err) => console.error("Failed to save chat log:", err));
    }
    return { reply: blockedReply, source: "fallback" };
  }

  const matchedFAQ = await searchFAQ(botId, question);
  if (matchedFAQ) {
    if (options.userId) {
      saveChatLog({
        userId: options.userId,
        botId,
        question,
        answer: matchedFAQ.answer,
        source: "mysql_faq",
      }).catch((err) => console.error("Failed to save chat log:", err));
    }
    await recordBotUsage({
      botId,
      lineUserId: options.userId || "unknown",
      userMessage: question,
      creditBefore: credit.creditBefore,
      creditAfter: credit.creditAfter,
      status: "consumed",
      source: "mysql_faq",
    });
    return { reply: matchedFAQ.answer, source: "mysql_faq" };
  }

  try {
    const { content: answer } = await openAICompatibleChat(
      [
        { role: "system", content: bot.system_prompt },
        { role: "user", content: buildPrompt(bot, question) },
      ],
      { temperature: 0.5, maxTokens: 1024 }
    );

    if (answer === AI_ERROR_MESSAGE || !answer) {
      if (options.userId) {
        saveChatLog({
          userId: options.userId,
          botId,
          question,
          answer: FALLBACK_MESSAGE,
          source: "fallback",
        }).catch((err) => console.error("Failed to save chat log:", err));
      }
      await recordBotUsage({
        botId,
        lineUserId: options.userId || "unknown",
        userMessage: question,
        creditBefore: credit.creditBefore,
        creditAfter: credit.creditAfter,
        status: "consumed",
        source: "fallback",
      });
      return { reply: FALLBACK_MESSAGE, source: "fallback" };
    }

    if (options.userId) {
      saveChatLog({
        userId: options.userId,
        botId,
        question,
        answer,
        source: "ai",
        }).catch((err) => console.error("Failed to save chat log:", err));
    }

    await recordBotUsage({
      botId,
      lineUserId: options.userId || "unknown",
      userMessage: question,
      creditBefore: credit.creditBefore,
      creditAfter: credit.creditAfter,
      status: "consumed",
      source: "ai",
    });

    return { reply: answer, source: "ai" };
  } catch (error) {
    console.error("AI Provider Error:", error);
    if (options.userId) {
      saveChatLog({
        userId: options.userId,
        botId,
        question,
        answer: FALLBACK_MESSAGE,
        source: "fallback",
        }).catch((err) => console.error("Failed to save chat log:", err));
    }
    await recordBotUsage({
      botId,
      lineUserId: options.userId || "unknown",
      userMessage: question,
      creditBefore: credit.creditBefore,
      creditAfter: credit.creditAfter,
      status: "consumed",
      source: "fallback",
    });
    return { reply: FALLBACK_MESSAGE, source: "fallback" };
  }
}
