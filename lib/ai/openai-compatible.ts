import { AIProviderConnectionError, AIProviderHTTPError, AIProviderInvalidResponseError, AIProviderTimeoutError } from "./provider";

export type OpenAICompatibleMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; [key: string]: unknown }>;
};

export type OpenAICompatibleResult = {
  content: string;
  raw: unknown;
};

function getConfig() {
  const apiUrl = process.env.OPENAI_API_URL || "";
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "";

  if (!apiUrl || !apiKey || !model) {
    throw new Error("Missing OPENAI_API_URL, OPENAI_API_KEY, or OPENAI_MODEL");
  }

  return { apiUrl, apiKey, model };
}

export async function openAICompatibleChat(
  messages: OpenAICompatibleMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<OpenAICompatibleResult> {
  const { apiUrl, apiKey, model } = getConfig();
  const timeoutMs = options.timeoutMs ?? 45000;

  return await new Promise<OpenAICompatibleResult>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new AIProviderTimeoutError("qwen")), timeoutMs);

    fetch(`${apiUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
      }),
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          reject(new AIProviderHTTPError("qwen", response.status));
          return;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (!content) {
          reject(new AIProviderInvalidResponseError("qwen", "Missing choices[0].message.content"));
          return;
        }

        resolve({ content, raw: data });
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error instanceof AIProviderTimeoutError || error instanceof AIProviderHTTPError || error instanceof AIProviderInvalidResponseError) {
          reject(error);
          return;
        }
        reject(new AIProviderConnectionError("qwen"));
      });
  });
}
