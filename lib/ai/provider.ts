/**
 * AI Provider Interface
 * Defines the contract for all AI providers
 */

export type AIProviderType = "qwen" | "gemini";

export interface AIProvider {
  readonly name: AIProviderType;
  readonly model: string;
  
  /**
   * Send a chat request to the provider
   * @param messages Array of message objects
   * @returns The AI response text
   */
  chat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string>;
  
  /**
   * Get provider configuration info (without secrets)
   */
  getConfig(): {
    name: AIProviderType;
    model: string;
  };
}

/**
 * Common error types for AI providers
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: AIProviderType,
    public readonly code?: string
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

/**
 * Timeout error
 */
export class AIProviderTimeoutError extends AIProviderError {
  constructor(provider: AIProviderType) {
    super("Request timeout", provider, "TIMEOUT");
  }
}

/**
 * Connection error
 */
export class AIProviderConnectionError extends AIProviderError {
  constructor(provider: AIProviderType) {
    super("Connection error", provider, "CONNECTION_ERROR");
  }
}

/**
 * HTTP error
 */
export class AIProviderHTTPError extends AIProviderError {
  constructor(
    provider: AIProviderType,
    public readonly statusCode: number
  ) {
    super(`HTTP ${statusCode}`, provider, `HTTP_${statusCode}`);
  }
}

/**
 * Invalid response error
 */
export class AIProviderInvalidResponseError extends AIProviderError {
  constructor(provider: AIProviderType, message: string) {
    super(message, provider, "INVALID_RESPONSE");
  }
}

/**
 * Create an AI provider instance based on the provider name
 */
export function createProvider(providerName: AIProviderType): AIProvider {
  if (providerName === "qwen") {
    return new (require("./qwen").QwenProvider)();
  }
  // Default to Gemini for any other value (including invalid)
  return new (require("./gemini").GeminiProvider)();
}

/**
 * Get the active provider name from environment variable
 * Returns "gemini" if AI_PROVIDER is invalid or not set
 */
export function getActiveProviderName(): AIProviderType {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  
  if (provider === "qwen") {
    return "qwen";
  }
  
  if (provider === "gemini") {
    return "gemini";
  }
  
  // Log warning for invalid value
  console.warn(`[AI Provider] Invalid AI_PROVIDER="${provider}", defaulting to "gemini"`);
  return "gemini";
}

/**
 * Get the active provider instance
 */
export function getActiveProvider(): AIProvider {
  const providerName = getActiveProviderName();
  return createProvider(providerName);
}