import { openAICompatibleChat } from "@/lib/ai/openai-compatible";
import type { BotDetail } from "@/lib/bots";
import type { ChatLog, ConversationChannel } from "@/lib/chat-log";
import type { FAQ } from "@/lib/faq";
import { executeQuery } from "@/lib/mysql";

export type CountedQuestion = {
  question: string;
  count: number;
};

export type SuggestedFAQ = {
  question: string;
  answer: string;
  category: string;
};

export type BusinessInsightAnalysis = {
  topQuestions: CountedQuestion[];
  missingFAQ: CountedQuestion[];
  suggestedFAQ: SuggestedFAQ[];
  businessInsight: string[];
};

export type ConversationDashboard = {
  totalConversations: number;
  recentConversations: ChatLog[];
  analysis: BusinessInsightAnalysis | null;
  analyzedAt: string | null;
};

type QuestionGroup = CountedQuestion & {
  sampleAnswer: string;
};

const EMPTY_ANALYSIS: BusinessInsightAnalysis = {
  topQuestions: [],
  missingFAQ: [],
  suggestedFAQ: [],
  businessInsight: [],
};

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseJsonObject(content: string): Record<string, unknown> {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain a JSON object");
  return JSON.parse(withoutFence.slice(start, end + 1)) as Record<string, unknown>;
}

function countedQuestions(value: unknown): CountedQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question = cleanText(row.question, 255);
    const count = Math.max(0, Math.round(Number(row.count) || 0));
    return question ? [{ question, count }] : [];
  });
}

function suggestedFAQs(value: unknown): SuggestedFAQ[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question = cleanText(row.question, 255);
    const answer = cleanText(row.answer, 4000);
    const category = cleanText(row.category, 100) || "General";
    return question && answer ? [{ question, answer, category }] : [];
  });
}

function normalizeAnalysisObject(parsed: Record<string, unknown>): BusinessInsightAnalysis {
  const businessInsight = Array.isArray(parsed.businessInsight)
    ? parsed.businessInsight
        .map((item) => cleanText(item, 500))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    topQuestions: countedQuestions(parsed.topQuestions),
    missingFAQ: countedQuestions(parsed.missingFAQ),
    suggestedFAQ: suggestedFAQs(parsed.suggestedFAQ),
    businessInsight,
  };
}

function normalizeAnalysis(content: string): BusinessInsightAnalysis {
  return normalizeAnalysisObject(parseJsonObject(content));
}

export async function getLatestAnalysis(botId: number): Promise<{
  analysis: BusinessInsightAnalysis;
  analyzedAt: string;
} | null> {
  const result = await executeQuery<{ analysisJson: string; analyzedAt: string }>(
    `SELECT analysis_json AS analysisJson, created_at AS analyzedAt
     FROM business_insight_snapshots
     WHERE bot_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [botId]
  );
  const snapshot = result.rows[0];
  if (!snapshot) return null;

  try {
    return {
      analysis: normalizeAnalysisObject(JSON.parse(snapshot.analysisJson) as Record<string, unknown>),
      analyzedAt: snapshot.analyzedAt,
    };
  } catch (error) {
    console.error("Invalid business insight snapshot:", error);
    return null;
  }
}

export async function saveAnalysisSnapshot(
  botId: number,
  analysis: BusinessInsightAnalysis,
  source: "ai" | "seed" = "ai"
): Promise<void> {
  await executeQuery(
    `INSERT INTO business_insight_snapshots (bot_id, analysis_json, conversation_count, source)
     SELECT ?, ?, COUNT(*), ? FROM chat_log WHERE bot_id = ?`,
    [botId, JSON.stringify(analysis), source, botId]
  );
}

export async function getConversationDashboard(botId: number): Promise<ConversationDashboard> {
  const [countResult, recentResult, latestAnalysis] = await Promise.all([
    executeQuery<{ total: number }>("SELECT COUNT(*) AS total FROM chat_log WHERE bot_id = ?", [botId]),
    executeQuery<{
      id: number;
      userId: string;
      botId: number;
      botName: string;
      channel: ConversationChannel;
      question: string;
      answer: string;
      source: "mysql_faq" | "ai" | "fallback";
      createdAt: string;
    }>(
      `SELECT cl.id, cl.user_id AS userId, cl.bot_id AS botId, b.bot_name AS botName,
              cl.channel, cl.user_message AS question, cl.bot_reply AS answer,
              cl.answer_source AS source, cl.created_at AS createdAt
       FROM chat_log cl
       LEFT JOIN bots b ON b.id = cl.bot_id
       WHERE cl.bot_id = ?
       ORDER BY cl.created_at DESC
       LIMIT 20`,
      [botId]
    ),
    getLatestAnalysis(botId),
  ]);

  return {
    totalConversations: Number(countResult.rows[0]?.total || 0),
    recentConversations: recentResult.rows,
    analysis: latestAnalysis?.analysis ?? null,
    analyzedAt: latestAnalysis?.analyzedAt ?? null,
  };
}

async function getQuestionGroups(botId: number): Promise<QuestionGroup[]> {
  const result = await executeQuery<QuestionGroup>(
    `SELECT user_message AS question, COUNT(*) AS count, MAX(bot_reply) AS sampleAnswer
     FROM chat_log
     WHERE bot_id = ?
     GROUP BY user_message
     ORDER BY count DESC, question ASC`,
    [botId]
  );
  return result.rows.map((row) => ({ ...row, count: Number(row.count) }));
}

export async function analyzeConversations(
  bot: BotDetail,
  faqs: FAQ[]
): Promise<BusinessInsightAnalysis> {
  const conversations = await getQuestionGroups(bot.id);
  if (!conversations.length) return EMPTY_ANALYSIS;

  const prompt = `Analyze these customer conversations for the business owner.

Identify:
1. Most common questions
2. Questions not covered by FAQ
3. Suggested new FAQ
4. Business opportunities

Rules:
- Use the conversation count supplied for each unique question.
- Merge questions with the same intent and sum their counts.
- A missing FAQ must not be adequately covered by the existing FAQ list.
- Return 3-5 concise, practical business recommendations.
- Return JSON only, with no markdown.

Business:
${JSON.stringify({ name: bot.business_name, description: bot.business_description })}

Existing FAQ:
${JSON.stringify(faqs.filter((faq) => faq.faq_status === "active" && faq.is_active === 1).map((faq) => ({ question: faq.question, answer: faq.answer })))}

Customer conversations (all unique questions with occurrence counts):
${JSON.stringify(conversations)}

JSON format:
{
  "topQuestions": [{ "question": "...", "count": 15 }],
  "missingFAQ": [{ "question": "...", "count": 8 }],
  "suggestedFAQ": [{ "question": "...", "answer": "...", "category": "General" }],
  "businessInsight": ["..."]
}`;

  const { content } = await openAICompatibleChat(
    [
      { role: "system", content: "You are a business conversation analyst. Return valid JSON only." },
      { role: "user", content: prompt },
    ],
    { temperature: 0.2, maxTokens: 2048, timeoutMs: 60000 }
  );

  return normalizeAnalysis(content);
}

export async function generateSuggestedFAQ(
  bot: BotDetail,
  question: string,
  faqs: FAQ[]
): Promise<SuggestedFAQ> {
  const prompt = `Generate one accurate draft FAQ for this business based on a frequently asked customer question.

Business:
${JSON.stringify({ name: bot.business_name, description: bot.business_description })}

Customer question:
${JSON.stringify(question)}

Existing FAQ for tone and factual context:
${JSON.stringify(faqs.filter((faq) => faq.is_active === 1).map((faq) => ({ question: faq.question, answer: faq.answer })))}

Do not invent prices, policies, or promises that are not in the business context. If details are unavailable, write a helpful answer that asks the customer to contact the business for confirmation.

Return JSON only:
{ "question": "...", "answer": "...", "category": "General" }`;

  const { content } = await openAICompatibleChat(
    [
      { role: "system", content: "You write concise business FAQs. Return valid JSON only." },
      { role: "user", content: prompt },
    ],
    { temperature: 0.3, maxTokens: 800 }
  );
  const parsed = parseJsonObject(content);
  const generated = suggestedFAQs([parsed])[0];
  if (!generated) throw new Error("AI returned an invalid FAQ");
  return generated;
}
