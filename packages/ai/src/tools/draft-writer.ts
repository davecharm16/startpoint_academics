import type { RegisteredTool, ToolResult, ToolContext } from "./types";

export type InsertPosition = "cursor" | "start" | "end" | "replace";

interface DraftWriteInput {
  content: string;
  position: InsertPosition;
  format?: "text" | "markdown" | "html";
}

/**
 * Write content to the document draft
 * Note: This tool creates a write instruction that the frontend will process
 * The actual DOM manipulation happens in the React component
 */
async function executeDraftWrite(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<ToolResult> {
  const content = input.content as string;
  const position = (input.position as InsertPosition) || "cursor";
  const format = (input.format as "text" | "markdown" | "html") || "markdown";

  if (!content) {
    return {
      success: false,
      error: "Content is required",
    };
  }

  // Return the write instruction for the frontend to process
  // The API route will store this and the frontend will apply it
  return {
    success: true,
    data: {
      type: "draft_write",
      instruction: {
        content,
        position,
        format,
        sessionId: context.sessionId,
        projectId: context.projectId,
        timestamp: new Date().toISOString(),
      },
    },
  };
}

export const draftWriterTool: RegisteredTool = {
  definition: {
    name: "write_to_draft",
    description:
      "Write or insert content into the document draft. The content will appear in the editor for the writer to review and edit.",
    input_schema: {
      type: "object" as const,
      properties: {
        content: {
          type: "string",
          description:
            "The content to write to the draft. Can include markdown formatting.",
        },
        position: {
          type: "string",
          enum: ["cursor", "start", "end", "replace"],
          description:
            "Where to insert the content: 'cursor' (at cursor position), 'start' (beginning of document), 'end' (end of document), 'replace' (replace entire document). Default: 'cursor'",
        },
        format: {
          type: "string",
          enum: ["text", "markdown", "html"],
          description:
            "Format of the content. Default: 'markdown'. Markdown will be converted to rich text.",
        },
      },
      required: ["content"],
    },
  },
  execute: executeDraftWrite,
};
