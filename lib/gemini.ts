import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let ai: GoogleGenAI | null = null;

function getClient() {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  ai ??= new GoogleGenAI({ apiKey });
  return ai;
}

export async function askGemini(
  prompt: string
): Promise<string> {
  const response = await getClient().models.generateContent({
    model,
    contents: prompt,
  });

  return response.text?.trim() || "";
}
