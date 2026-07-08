import { AIProvider, AIProviderError, AIProviderTimeoutError, AIProviderConnectionError, AIProviderHTTPError, AIProviderInvalidResponseError } from "./provider";
import { QwenProvider } from "./qwen";
import { GeminiProvider } from "./gemini";

/**
 * Failover Manager
 * Handles automatic failover between AI providers
 */
export class FailoverManager {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;
  private fallbackMessage: string;

  constructor() {
    // Initialize providers
    this.primaryProvider = new QwenProvider();
    this.fallbackProvider = new GeminiProvider();
    this.fallbackMessage = "ขออภัย ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }

  /**
   * Get the name of the primary provider
   */
  getPrimaryName(): string {
    return this.primaryProvider.name;
  }

  /**
   * Get the name of the fallback provider
   */
  getFallbackName(): string {
    return this.fallbackProvider.name;
  }

  /**
   * Send a chat request with automatic failover
   * 
   * Flow:
   * 1. Try primary provider (Qwen)
   * 2. If fails, retry once
   * 3. If still fails, try fallback provider (Gemini)
   * 4. If both fail, return fallback message
   * 
   * @param messages Array of message objects
   * @returns The AI response text or fallback message
   */
  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    const primaryName = this.primaryProvider.name;
    const fallbackName = this.fallbackProvider.name;

    // Step 1: Try primary provider
    try {
      const response = await this.primaryProvider.chat(messages);
      console.log(`[AI Failover] Success with ${primaryName}`);
      return response;
    } catch (error) {
      console.log(`[AI Failover] ${primaryName} failed, will retry...`);

      // Step 2: Retry primary provider once
      try {
        const response = await this.primaryProvider.chat(messages);
        console.log(`[AI Failover] Success with ${primaryName} on retry`);
        return response;
      } catch (retryError) {
        console.log(`[AI Failover] ${primaryName} retry failed, trying ${fallbackName}...`);

        // Step 3: Try fallback provider
        try {
          const response = await this.fallbackProvider.chat(messages);
          console.log(`[AI Failover] Success with ${fallbackName} (fallback)`);
          return response;
        } catch (fallbackError) {
          console.error(`[AI Failover] Both ${primaryName} and ${fallbackName} failed`);
          console.error(`[AI Failover] Primary error: ${(error as Error).message}`);
          console.error(`[AI Failover] Retry error: ${(retryError as Error).message}`);
          console.error(`[AI Failover] Fallback error: ${(fallbackError as Error).message}`);

          // Step 4: Return fallback message
          return this.fallbackMessage;
        }
      }
    }
  }

  /**
   * Send a chat request with automatic failover and detailed logging
   * 
   * @param messages Array of message objects
   * @returns Object containing the response and metadata
   */
  async chatWithMetadata(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<{ reply: string; provider: string; success: boolean }> {
    const primaryName = this.primaryProvider.name;
    const fallbackName = this.fallbackProvider.name;

    // Step 1: Try primary provider
    try {
      const response = await this.primaryProvider.chat(messages);
      console.log(`[AI Failover] Success with ${primaryName}`);
      return {
        reply: response,
        provider: primaryName,
        success: true,
      };
    } catch (error) {
      console.log(`[AI Failover] ${primaryName} failed, will retry...`);

      // Step 2: Retry primary provider once
      try {
        const response = await this.primaryProvider.chat(messages);
        console.log(`[AI Failover] Success with ${primaryName} on retry`);
        return {
          reply: response,
          provider: primaryName,
          success: true,
        };
      } catch (retryError) {
        console.log(`[AI Failover] ${primaryName} retry failed, trying ${fallbackName}...`);

        // Step 3: Try fallback provider
        try {
          const response = await this.fallbackProvider.chat(messages);
          console.log(`[AI Failover] Success with ${fallbackName} (fallback)`);
          return {
            reply: response,
            provider: fallbackName,
            success: true,
          };
        } catch (fallbackError) {
          console.error(`[AI Failover] Both ${primaryName} and ${fallbackName} failed`);
          console.error(`[AI Failover] Primary error: ${(error as Error).message}`);
          console.error(`[AI Failover] Retry error: ${(retryError as Error).message}`);
          console.error(`[AI Failover] Fallback error: ${(fallbackError as Error).message}`);

          // Step 4: Return fallback message
          return {
            reply: this.fallbackMessage,
            provider: "none",
            success: false,
          };
        }
      }
    }
  }
}

// Singleton instance
let failoverManager: FailoverManager | null = null;

/**
 * Get the singleton failover manager instance
 */
export function getFailoverManager(): FailoverManager {
  if (!failoverManager) {
    failoverManager = new FailoverManager();
  }
  return failoverManager;
}