import { executeQuery, QueryResult } from "./mysql";

/**
 * FAQ data structure
 * Matches the Google Sheets format (two columns: question, answer)
 */
export type FAQ = {
  id: number;
  bot_id: number;
  question: string;
  answer: string;
  is_active: 0 | 1;
  source_type?: "manual" | "description" | "image" | "website";
  source_ref?: string | null;
  source_meta?: string | null;
  language_code?: string;
  faq_status?: "draft" | "active" | "archived";
  confidence_score?: number;
  wizard_id?: number | null;
  created_at: string;
  updated_at: string | null;
};

/**
 * Get all FAQ entries from MySQL database
 * @returns Array of FAQ objects
 */
export async function getFAQData(botId?: number): Promise<FAQ[]> {
  try {
    const result: QueryResult<FAQ> = botId
        ? await executeQuery<FAQ>(
          "SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE bot_id = ? ORDER BY id ASC",
          [botId]
        )
      : await executeQuery<FAQ>(
          "SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq ORDER BY id ASC"
        );
    return result.rows;
  } catch (error) {
    console.error("Error fetching FAQ data from MySQL:", error);
    return [];
  }
}

/**
 * Get FAQ entry by ID
 * @param id - FAQ entry ID
 * @returns FAQ object or null if not found
 */
export async function getFAQById(id: number): Promise<FAQ | null> {
  try {
    const result: QueryResult<FAQ> = await executeQuery<FAQ>(
      "SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE id = ?",
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching FAQ with id ${id}:`, error);
    return null;
  }
}

/**
 * Get FAQ entry by question (fuzzy match)
 * @param question - Question text to search for
 * @returns Array of matching FAQ objects
 */
export async function getFAQByQuestion(question: string, botId?: number): Promise<FAQ[]> {
  try {
    const result: QueryResult<FAQ> = botId
      ? await executeQuery<FAQ>(
          "SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE bot_id = ? AND question LIKE ? AND is_active = 1 ORDER BY id ASC",
          [botId, `%${question}%`]
        )
      : await executeQuery<FAQ>(
          "SELECT id, bot_id, question, answer, is_active, source_type, source_ref, source_meta, language_code, faq_status, confidence_score, wizard_id, created_at, updated_at FROM faq WHERE question LIKE ? AND is_active = 1 ORDER BY id ASC",
          [`%${question}%`]
        );
    return result.rows;
  } catch (error) {
    console.error(`Error fetching FAQ for question "${question}":`, error);
    return [];
  }
}

/**
 * Add a new FAQ entry
 * @param question - Question text
 * @param answer - Answer text
 * @returns The newly created FAQ object
 */
export async function addFAQ(
  botId: number,
  question: string,
  answer: string
): Promise<FAQ | null> {
  try {
    const result: QueryResult<FAQ> = await executeQuery<FAQ>(
      "INSERT INTO faq (bot_id, question, answer, is_active, source_type, language_code, faq_status, confidence_score) VALUES (?, ?, ?, 1, 'manual', 'th', 'active', 1.0000)",
      [botId, question, answer]
    );

    if (!result.insertId) {
      return null;
    }

    // Get the newly created FAQ
    const newFAQ = await getFAQById(result.insertId);
    return newFAQ;
  } catch (error) {
    console.error("Error adding new FAQ:", error);
    return null;
  }
}

/**
 * Update an existing FAQ entry
 * @param id - FAQ entry ID
 * @param question - New question text (optional)
 * @param answer - New answer text (optional)
 * @returns Updated FAQ object or null if not found
 */
export async function updateFAQ(
  id: number,
  question?: string,
  answer?: string,
  isActive?: boolean
): Promise<FAQ | null> {
  try {
    // Build dynamic update query
    const updates: string[] = [];
    const params: any[] = [];

    if (question) {
      updates.push("question = ?");
      params.push(question);
    }
    if (answer) {
      updates.push("answer = ?");
      params.push(answer);
    }
    if (typeof isActive === "boolean") {
      updates.push("is_active = ?");
      params.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return getFAQById(id);
    }

    params.push(id);
    await executeQuery(`UPDATE faq SET ${updates.join(", ")} WHERE id = ?`, params);

    return getFAQById(id);
  } catch (error) {
    console.error(`Error updating FAQ with id ${id}:`, error);
    return null;
  }
}

/**
 * Delete an FAQ entry
 * @param id - FAQ entry ID
 * @returns true if deleted, false otherwise
 */
export async function deleteFAQ(id: number): Promise<boolean> {
  try {
    await executeQuery("DELETE FROM faq WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error(`Error deleting FAQ with id ${id}:`, error);
    return false;
  }
}

export async function searchFAQsByBot(botId: number, query: string) {
  return getFAQByQuestion(query, botId);
}
