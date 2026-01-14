import Anthropic from "@anthropic-ai/sdk";
import { getClient, models } from "./client";
import {
  getToolDefinitions,
  getToolExecutor,
  type ToolContext,
  type ToolResult,
} from "./tools";
import {
  checkUsageLimits,
  filterContent,
  validateProject,
  type UsageStats,
  type UsageLimits,
  type ProjectInfo,
  type ProjectContext,
  DEFAULT_LIMITS,
} from "./guardrails";

/**
 * Agent configuration
 */
export interface AgentConfig {
  systemPrompt?: string;
  maxTurns?: number;
  usageLimits?: UsageLimits;
}

/**
 * Message in the conversation
 */
export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  toolUse?: {
    name: string;
    input: Record<string, unknown>;
  };
  toolResult?: ToolResult;
  tokensUsed?: number;
}

/**
 * Streaming callback for real-time updates
 */
export type StreamCallback = (event: StreamEvent) => void;

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "tool_use_start"; name: string }
  | { type: "tool_use_end"; name: string; result: ToolResult }
  | { type: "done"; message: AgentMessage; tokensUsed: number }
  | { type: "error"; error: string }
  | { type: "blocked"; reason: string };

/**
 * Default system prompt for the writing assistant
 */
const DEFAULT_SYSTEM_PROMPT = `You are an expert academic writing assistant for Startpoint Academics. Your role is to help writers create high-quality academic content.

## Capabilities
- Search the web for sources and information
- Search academic papers via Semantic Scholar
- Scrape content from URLs for reference
- Read uploaded PDFs and images
- Write content directly to the document draft
- Format citations in APA 7th, MLA 9th, Chicago, or custom styles
- Analyze writing for grammar, style, clarity, and academic quality

## Guidelines
1. Always cite sources when using external information
2. Write in an appropriate academic tone for the project level
3. Use the write_to_draft tool to add content to the document
4. When searching, prefer academic sources over general web content
5. Format all citations in the requested style (ask if not specified)
6. Be thorough in research but concise in communication
7. When analyzing writing, provide specific, actionable feedback

## Restrictions
- Only assist with academic writing tasks
- Do not write code or help with programming
- Do not assist with plagiarism or academic dishonesty
- Stay focused on the assigned project topic`;

/**
 * Run the writing agent with a user message
 */
export async function runAgent(
  message: string,
  context: {
    sessionId: string;
    projectId: string;
    writerId: string;
    project?: ProjectInfo;
    projectContext?: ProjectContext;
    usageStats?: UsageStats;
    conversationHistory?: Anthropic.MessageParam[];
  },
  config: AgentConfig = {},
  onStream?: StreamCallback
): Promise<AgentMessage> {
  const client = getClient();
  const limits = config.usageLimits || DEFAULT_LIMITS;

  // Validate project assignment
  if (context.project) {
    const projectValidation = validateProject(context.project, context.writerId);
    if (!projectValidation.valid) {
      const errorMsg = projectValidation.error || "Project validation failed";
      onStream?.({ type: "blocked", reason: errorMsg });
      throw new Error(errorMsg);
    }
  }

  // Check usage limits
  if (context.usageStats) {
    const usageCheck = checkUsageLimits(context.usageStats, limits);
    if (!usageCheck.allowed) {
      const errorMsg = usageCheck.reason || "Usage limit exceeded";
      onStream?.({ type: "blocked", reason: errorMsg });
      throw new Error(errorMsg);
    }
  }

  // Filter content for relevance
  const contentFilter = await filterContent(message, context.projectContext);
  if (!contentFilter.allowed) {
    const errorMsg = contentFilter.reason || "Message blocked by content filter";
    onStream?.({ type: "blocked", reason: errorMsg });
    throw new Error(errorMsg);
  }

  // Build messages array
  const messages: Anthropic.MessageParam[] = [
    ...(context.conversationHistory || []),
    { role: "user", content: message },
  ];

  const toolContext: ToolContext = {
    sessionId: context.sessionId,
    projectId: context.projectId,
    writerId: context.writerId,
  };

  // Run the agent loop
  let totalTokensUsed = 0;
  let turns = 0;
  const maxTurns = config.maxTurns || 10;
  let finalResponse = "";

  while (turns < maxTurns) {
    turns++;

    const response = await client.messages.create({
      model: models.assistant,
      max_tokens: 4096,
      system: config.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      tools: getToolDefinitions(),
      messages,
    });

    totalTokensUsed += response.usage.input_tokens + response.usage.output_tokens;

    // Process the response
    let hasToolUse = false;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        finalResponse += block.text;
        onStream?.({ type: "text", text: block.text });
      } else if (block.type === "tool_use") {
        hasToolUse = true;
        onStream?.({ type: "tool_use_start", name: block.name });

        // Execute the tool
        const executor = getToolExecutor(block.name);
        let result: ToolResult;

        if (executor) {
          result = await executor(
            block.input as Record<string, unknown>,
            toolContext
          );
        } else {
          result = {
            success: false,
            error: `Unknown tool: ${block.name}`,
          };
        }

        onStream?.({ type: "tool_use_end", name: block.name, result });

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    // If there were tool uses, continue the conversation
    if (hasToolUse) {
      messages.push({
        role: "assistant",
        content: response.content,
      });
      messages.push({
        role: "user",
        content: toolResults,
      });
    }

    // Check if we should stop
    if (response.stop_reason === "end_turn" || !hasToolUse) {
      break;
    }
  }

  const agentMessage: AgentMessage = {
    role: "assistant",
    content: finalResponse,
    tokensUsed: totalTokensUsed,
  };

  onStream?.({ type: "done", message: agentMessage, tokensUsed: totalTokensUsed });

  return agentMessage;
}
