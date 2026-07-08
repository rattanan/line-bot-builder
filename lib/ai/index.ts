/**
 * AI Module - Centralized AI Provider Interface
 * 
 * This module provides a unified interface for all AI operations.
 * Business logic should only call `ai.chat(messages)` and never
 * directly call Qwen or Gemini.
 * 
 * Architecture:
 * - provider.ts: Interface, factory functions, and provider selection
 * - qwen.ts: Qwen AI provider (OpenAI-compatible API)
 * - gemini.ts: Gemini AI provider (Google GenAI)
 * - index.ts: Main entry point with singleton instance
 * 
 * Provider Selection:
 * - Set AI_PROVIDER=gemini or AI_PROVIDER=qwen in environment
 * - Invalid values default to "gemini" with a warning
 * - No automatic failover - single provider per runtime
 */

import { getActiveProvider } from "./provider";

/**
 * AI Chat Interface
 * This is the only interface that business logic should use.
 */
export interface AIChat {
  /**
   * Send a chat request to the AI provider
   * @param messages Array of message objects
   * @returns The AI response text
   */
  chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string>;
}

/**
 * Provider-specific chat implementation
 */
class ProviderChat implements AIChat {
  private provider = getActiveProvider();

  async chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
    const startTime = Date.now();
    const promptLength = JSON.stringify(messages).length;

    try {
      const response = await this.provider.chat(messages);
      const responseTime = Date.now() - startTime;

      console.log(`AI Provider : ${this.provider.name}`);
      console.log(`Model : ${this.provider.model}`);
      console.log(`Response : ${responseTime} ms`);
      console.log(`Prompt length : ${promptLength} chars`);

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      console.log(`AI Provider : ${this.provider.name}`);
      console.log(`Model : ${this.provider.model}`);
      console.log(`Response : ${responseTime} ms`);
      console.log(`Prompt length : ${promptLength} chars`);
      console.error(`[AI Provider] ${this.provider.name} failed:`, error);

      // Re-throw the error so the caller can handle it
      throw error;
    }
  }
}

/**
 * Get the AI chat instance
 * This is the only way business logic should interact with AI
 */
export function getAIChat(): AIChat {
  return new ProviderChat();
}

// Export singleton instance
export const ai = getAIChat();

// Re-export types and errors for convenience
export { type AIProvider, type AIProviderType } from "./provider";
export { AIProviderError, AIProviderTimeoutError, AIProviderConnectionError, AIProviderHTTPError, AIProviderInvalidResponseError } from "./provider";
export { QwenProvider } from "./qwen";
export { GeminiProvider } from "./gemini";