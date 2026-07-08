import { GoogleGenAI } from "@google/genai";
import { AIProvider, AIProviderError, AIProviderTimeoutError, AIProviderConnectionError, AIProviderHTTPError, AIProviderInvalidResponseError } from "./provider";

/**
 * Gemini Provider - Uses Google GenAI
 * Fallback AI provider for the application
 */
export class GeminiProvider implements AIProvider {
  readonly name: "gemini" = "gemini";
  readonly model: string;

  private readonly apiKey: string;
  private readonly timeoutMs: number = 30000; // 30 seconds
  private ai: GoogleGenAI | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY is not set. Gemini provider may fail.");
    }
  }

  getConfig(): { name: "gemini"; model: string } {
    return {
      name: this.name,
      model: this.model,
    };
  }

  private getClient(): GoogleGenAI {
    if (!this.apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    this.ai ??= new GoogleGenAI({ apiKey: this.apiKey });
    return this.ai;
  }

  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    const startTime = Date.now();
    const promptLength = JSON.stringify(messages).length;

    try {
      // Convert messages to Gemini format
      // Gemini expects contents as a string or array of content objects
      // We'll use the last user message as the prompt
      const userMessage = messages.find((m) => m.role === "user");
      if (!userMessage) {
        throw new AIProviderInvalidResponseError(this.name, "No user message found");
      }

      const response = await this.fetchWithTimeout(
        () => this.getClient().models.generateContent({
          model: this.model,
          contents: userMessage.content,
        }),
        this.timeoutMs
      );

      const responseTime = Date.now() - startTime;
      console.log(`AI Provider : ${this.name}`);
      console.log(`Model : ${this.model}`);
      console.log(`Response : ${responseTime} ms`);
      console.log(`Prompt length : ${promptLength} chars`);

      const text = response.text?.trim() || "";

      if (!text) {
        throw new AIProviderInvalidResponseError(this.name, "Empty response from Gemini");
      }

      return text;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.log(`AI Provider : ${this.name}`);
      console.log(`Model : ${this.model}`);
      console.log(`Response : ${responseTime} ms`);
      console.log(`Prompt length : ${promptLength} chars`);

      if (error instanceof AIProviderTimeoutError) {
        console.error(`[AI Provider] ${this.name} FAILED - Reason: Timeout`);
        throw error;
      }

      if (error instanceof AIProviderConnectionError) {
        console.error(`[AI Provider] ${this.name} FAILED - Reason: Connection Error`);
        throw error;
      }

      if (error instanceof AIProviderHTTPError) {
        console.error(`[AI Provider] ${this.name} FAILED - Reason: HTTP ${error.statusCode}`);
        throw error;
      }

      if (error instanceof AIProviderInvalidResponseError) {
        console.error(`[AI Provider] ${this.name} FAILED - Reason: Invalid Response`);
        throw error;
      }

      if (error instanceof Error) {
        console.error(`[AI Provider] ${this.name} FAILED - Reason: ${error.message}`);
        throw new AIProviderConnectionError(this.name);
      }

      console.error(`[AI Provider] ${this.name} FAILED - Unknown error`);
      throw new AIProviderConnectionError(this.name);
    }
  }

  private fetchWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new AIProviderTimeoutError(this.name));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          // Check for network errors
          if (error.name === "TypeError" && (error.message.includes("fetch") || error.message.includes("network"))) {
            reject(new AIProviderConnectionError(this.name));
          } else if (error.name === "AbortError") {
            reject(new AIProviderTimeoutError(this.name));
          } else {
            reject(error);
          }
        });
    });
  }
}