import { executeQuery, withTransaction } from "./mysql";
import type { FAQ } from "./faq";

export type BotKnowledgeWizardStatus =
  | "draft"
  | "scraping"
  | "extracting_images"
  | "generating_faq"
  | "ready_for_review"
  | "approved"
  | "cancelled";

export type BotKnowledgeWizard = {
  id: number;
  bot_id: number;
  user_id: number;
  website_url: string | null;
  status: BotKnowledgeWizardStatus;
  created_at: string;
  updated_at: string | null;
};

export type KnowledgeCandidateStatus = "draft" | "approved" | "rejected" | "merged";

export type KnowledgeCandidate = {
  id: number;
  bot_id: number;
  wizard_id: number;
  question: string;
  answer: string;
  category: string | null;
  confidence_score: number;
  source_type: "description" | "image" | "website";
  source_ref: string | null;
  language_code: string;
  status: KnowledgeCandidateStatus;
  created_at: string;
  updated_at: string | null;
};

export type KnowledgeCandidateSource = {
  source_type: "description" | "image" | "website";
  source_ref: string | null;
  source_meta?: Record<string, unknown> | null;
};

export async function createBotKnowledgeWizard(input: {
  botId: number;
  userId: number;
  websiteUrl?: string | null;
}) {
  const result = await executeQuery<BotKnowledgeWizard>(
    `INSERT INTO bot_knowledge_wizard (bot_id, user_id, website_url, status, updated_at)
     VALUES (?, ?, ?, 'draft', CURRENT_TIMESTAMP)`,
    [input.botId, input.userId, input.websiteUrl ?? null]
  );
  return result.insertId ? getBotKnowledgeWizardById(result.insertId) : null;
}

export async function getBotKnowledgeWizardById(id: number) {
  const result = await executeQuery<BotKnowledgeWizard>(
    `SELECT id, bot_id, user_id, website_url, status, created_at, updated_at
     FROM bot_knowledge_wizard
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getLatestWizardForBot(botId: number) {
  const result = await executeQuery<BotKnowledgeWizard>(
    `SELECT id, bot_id, user_id, website_url, status, created_at, updated_at
     FROM bot_knowledge_wizard
     WHERE bot_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [botId]
  );
  return result.rows[0] ?? null;
}

export async function updateWizardStatus(id: number, status: BotKnowledgeWizardStatus) {
  await executeQuery(`UPDATE bot_knowledge_wizard SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [status, id]);
  return getBotKnowledgeWizardById(id);
}

export async function addKnowledgeCandidates(
  wizardId: number,
  botId: number,
  candidates: Array<{
    question: string;
    answer: string;
    category?: string | null;
    confidenceScore?: number;
    sourceType: KnowledgeCandidate["source_type"];
    sourceRef?: string | null;
    languageCode?: string;
    status?: KnowledgeCandidateStatus;
  }>
) {
  return withTransaction(async (connection) => {
    for (const candidate of candidates) {
      await connection.execute(
        `INSERT INTO bot_knowledge_candidates (
          bot_id, wizard_id, question, answer, category, confidence_score, source_type, source_ref, language_code, status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          botId,
          wizardId,
          candidate.question,
          candidate.answer,
          candidate.category ?? null,
          candidate.confidenceScore ?? 0,
          candidate.sourceType,
          candidate.sourceRef ?? null,
          candidate.languageCode ?? "th",
          candidate.status ?? "draft",
        ]
      );
    }
  });
}

export async function listKnowledgeCandidatesByWizard(wizardId: number, botId?: number) {
  const result = botId
    ? await executeQuery<KnowledgeCandidate>(
        `SELECT id, bot_id, wizard_id, question, answer, category, confidence_score, source_type, source_ref, language_code, status, created_at, updated_at
         FROM bot_knowledge_candidates
         WHERE wizard_id = ? AND bot_id = ?
         ORDER BY id ASC`,
        [wizardId, botId]
      )
    : await executeQuery<KnowledgeCandidate>(
        `SELECT id, bot_id, wizard_id, question, answer, category, confidence_score, source_type, source_ref, language_code, status, created_at, updated_at
         FROM bot_knowledge_candidates
         WHERE wizard_id = ?
         ORDER BY id ASC`,
        [wizardId]
      );
  return result.rows;
}

export async function updateKnowledgeCandidate(
  id: number,
  botId: number,
  input: Partial<Pick<KnowledgeCandidate, "question" | "answer" | "category" | "confidence_score" | "status" | "language_code">>
) {
  const updates: string[] = [];
  const params: Array<string | number | null> = [];

  if (input.question !== undefined) {
    updates.push("question = ?");
    params.push(input.question);
  }
  if (input.answer !== undefined) {
    updates.push("answer = ?");
    params.push(input.answer);
  }
  if (input.category !== undefined) {
    updates.push("category = ?");
    params.push(input.category);
  }
  if (input.confidence_score !== undefined) {
    updates.push("confidence_score = ?");
    params.push(input.confidence_score);
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    params.push(input.status);
  }
  if (input.language_code !== undefined) {
    updates.push("language_code = ?");
    params.push(input.language_code);
  }

  if (!updates.length) return null;
  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id, botId);
  await executeQuery(`UPDATE bot_knowledge_candidates SET ${updates.join(", ")} WHERE id = ? AND bot_id = ?`, params);
  const result = await executeQuery<KnowledgeCandidate>(
    `SELECT id, bot_id, wizard_id, question, answer, category, confidence_score, source_type, source_ref, language_code, status, created_at, updated_at
     FROM bot_knowledge_candidates
     WHERE id = ? AND bot_id = ?
     LIMIT 1`,
    [id, botId]
  );
  return result.rows[0] ?? null;
}

export async function deleteKnowledgeCandidate(id: number, botId: number) {
  await executeQuery(`DELETE FROM bot_knowledge_candidates WHERE id = ? AND bot_id = ?`, [id, botId]);
}

export async function approveKnowledgeCandidate(candidateId: number, botId: number): Promise<FAQ | null> {
  const candidate = await executeQuery<KnowledgeCandidate>(
    `SELECT id, bot_id, wizard_id, question, answer, category, confidence_score, source_type, source_ref, language_code, status, created_at, updated_at
     FROM bot_knowledge_candidates
     WHERE id = ? AND bot_id = ?
     LIMIT 1`,
    [candidateId, botId]
  );
  const row = candidate.rows[0];
  if (!row) return null;
  if (row.status === "approved") return null;

  const result = await executeQuery<FAQ>(
    `INSERT INTO faq (bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?, 'active', ?, ?)`,
    [
      row.bot_id,
      row.question,
      row.answer,
      row.source_type,
      row.source_ref,
      JSON.stringify({ candidateId: row.id, wizardId: row.wizard_id, category: row.category }),
      row.language_code,
      row.confidence_score,
      row.wizard_id,
    ]
  );

  await updateKnowledgeCandidate(candidateId, botId, { status: "approved" });
  return result.insertId ? (await executeQuery<FAQ>(`SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE id = ?`, [result.insertId])).rows[0] ?? null : null;
}

export async function mergeKnowledgeCandidates(wizardId: number, botId?: number): Promise<KnowledgeCandidate[]> {
  const candidates = await listKnowledgeCandidatesByWizard(wizardId, botId);
  const merged = new Map<string, KnowledgeCandidate>();

  for (const candidate of candidates) {
    const key = normalizeQuestion(candidate.question);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, candidate);
      continue;
    }

    const existingScore = Number(existing.confidence_score) || 0;
    const currentScore = Number(candidate.confidence_score) || 0;
    if (currentScore > existingScore) {
      merged.set(key, candidate);
    }
  }

  return Array.from(merged.values());
}

export async function archiveApprovedFAQ(faqId: number): Promise<FAQ | null> {
  await executeQuery(`UPDATE faq SET faq_status = 'archived', is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [faqId]);
  const result = await executeQuery<FAQ>(`SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE id = ?`, [faqId]);
  return result.rows[0] ?? null;
}

function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
