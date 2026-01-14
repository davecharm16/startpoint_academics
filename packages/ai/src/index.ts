// Re-export types from Anthropic SDK for consumers
import type Anthropic from "@anthropic-ai/sdk";
export type MessageParam = Anthropic.MessageParam;

// Client
export { getClient, models, type ModelId } from "./client";

// Agent
export {
  runAgent,
  type AgentConfig,
  type AgentMessage,
  type StreamCallback,
  type StreamEvent,
} from "./agent";

// Tools
export {
  allTools,
  getToolDefinitions,
  getToolExecutor,
  type ToolDefinition,
  type ToolResult,
  type ToolContext,
  type ToolExecutor,
  type RegisteredTool,
  type CitationStyle,
  type InsertPosition,
} from "./tools";

// Guardrails
export {
  checkUsageLimits,
  filterContent,
  validateProject,
  validateSessionOwnership,
  getDailyResetTime,
  getWeeklyResetTime,
  estimateTokens,
  DEFAULT_LIMITS,
  type UsageLimits,
  type UsageStats,
  type UsageCheckResult,
  type ContentFilterResult,
  type ProjectContext,
  type ValidationResult,
  type ProjectInfo,
} from "./guardrails";

// Export
export { generateDocx, type ExportOptions } from "./export";
