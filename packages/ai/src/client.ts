import Anthropic from "@anthropic-ai/sdk";

let clientInstance: Anthropic | null = null;

/**
 * Get or create the Anthropic client singleton
 */
export function getClient(): Anthropic {
  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    clientInstance = new Anthropic({ apiKey });
  }
  return clientInstance;
}

/**
 * Model configurations for different use cases
 */
export const models = {
  /** Main writing assistant - Claude Sonnet for best balance of quality and speed */
  assistant: "claude-sonnet-4-20250514" as const,
  /** Content filter - Claude Haiku for fast, cheap relevance checking */
  filter: "claude-haiku-4-20250514" as const,
} as const;

export type ModelId = (typeof models)[keyof typeof models];
