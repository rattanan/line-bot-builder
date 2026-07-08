import { AIProvider, AIProviderError, AIProviderTimeoutError, AIProviderConnectionError, AIProviderHTTPError, AIProviderInvalidResponseError } from "./provider";

/**
 * Qwen Provider - Uses OpenAI-compatible API
 * Primary AI provider for the application
 */
export class QwenProvider implements AIProvider {
  readonly name: "qwen" = "qwen";
  readonly model: string;

  // Configuration values. These are initialized from environment variables but can be overridden
  // at runtime via `setQwenSettings`. Keeping them as instance properties allows the provider to be
  // instantiated multiple times with the same configuration.
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number = 30000; // 30 seconds

  constructor() {
    // Read configuration directly from env so provider creation cannot fail at import time.
    this.apiUrl = process.env.QWEN_API_URL || "https://api.openai.com/v1";
    this.apiKey = process.env.QWEN_API_KEY || "";
    this.model = process.env.QWEN_MODEL || "qwen2.5-coder-plus";

    if (!this.apiKey) {
      console.warn("QWEN_API_KEY is not set. Qwen provider may fail.");
    }
  }

  getConfig(): { name: "qwen"; model: string } {
    return {
      name: this.name,
      model: this.model,
    };
  }

  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    const startTime = Date.now();
    const promptLength = JSON.stringify(messages).length;

    try {
      const response = await this.fetchWithTimeout(
        `${this.apiUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 512,
          }),
        },
        this.timeoutMs
      );

      const responseTime = Date.now() - startTime;
      console.log(`AI Provider : ${this.name}`);
      console.log(`Model : ${this.model}`);
      console.log(`Response : ${responseTime} ms`);
      console.log(`Prompt length : ${promptLength} chars`);

      const data = await response.json();

      // Validate response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new AIProviderInvalidResponseError(this.name, "Missing choices in response");
      }

      const message = data.choices[0].message;
      if (!message || !message.content) {
        throw new AIProviderInvalidResponseError(this.name, "Missing message.content in response");
      }

      // Log token usage if available
      if (data.usage) {
        console.log(`[AI Provider] ${this.name} - Token Usage: ${JSON.stringify(data.usage)}`);
      }

      return message.content.trim();

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

  private fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new AIProviderTimeoutError(this.name));
      }, timeoutMs);

      fetch(url, options)
        .then((response) => {
          clearTimeout(timeoutId);
          
          // Check for HTTP errors
          if (!response.ok) {
            reject(new AIProviderHTTPError(this.name, response.status));
            return;
          }
          
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          
          // Check for network errors
          if (error.name === "TypeError" && error.message.includes("fetch")) {
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
