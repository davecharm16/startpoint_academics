import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tool definition for the Claude API
 */
export type ToolDefinition = Anthropic.Tool;

/**
 * Tool result from execution
 */
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Context passed to tools during execution
 */
export interface ToolContext {
  sessionId: string;
  projectId: string;
  writerId: string;
}

/**
 * Tool executor function type
 */
export type ToolExecutor = (
  input: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolResult>;

/**
 * Registered tool with definition and executor
 */
export interface RegisteredTool {
  definition: ToolDefinition;
  execute: ToolExecutor;
}
