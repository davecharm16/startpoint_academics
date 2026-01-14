export * from "./types";
export { webSearchTool } from "./web-search";
export { webScrapeTool } from "./web-scrape";
export { academicSearchTool } from "./academic-search";
export { citationTool, type CitationStyle } from "./citation";
export { draftWriterTool, type InsertPosition } from "./draft-writer";
export { fileReaderTool } from "./file-reader";
export { analyzeWritingTool } from "./analyze-writing";

import type { RegisteredTool } from "./types";
import { webSearchTool } from "./web-search";
import { webScrapeTool } from "./web-scrape";
import { academicSearchTool } from "./academic-search";
import { citationTool } from "./citation";
import { draftWriterTool } from "./draft-writer";
import { fileReaderTool } from "./file-reader";
import { analyzeWritingTool } from "./analyze-writing";

/**
 * All available tools for the writing agent
 */
export const allTools: RegisteredTool[] = [
  webSearchTool,
  webScrapeTool,
  academicSearchTool,
  citationTool,
  draftWriterTool,
  fileReaderTool,
  analyzeWritingTool,
];

/**
 * Get tool definitions for the Claude API
 */
export function getToolDefinitions() {
  return allTools.map((tool) => tool.definition);
}

/**
 * Get a tool executor by name
 */
export function getToolExecutor(name: string) {
  const tool = allTools.find((t) => t.definition.name === name);
  return tool?.execute;
}
