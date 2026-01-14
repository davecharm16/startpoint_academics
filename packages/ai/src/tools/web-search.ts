import type { RegisteredTool, ToolResult, ToolContext } from "./types";

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

interface BraveSearchResponse {
  web?: {
    results: Array<{
      title: string;
      url: string;
      description: string;
    }>;
  };
}

/**
 * Search the web using Brave Search API
 */
async function executeWebSearch(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const query = input.query as string;
  const count = (input.count as number) || 10;

  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "BRAVE_SEARCH_API_KEY is not configured",
    };
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Search failed: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as BraveSearchResponse;
    const results: BraveSearchResult[] =
      data.web?.results.map((r) => ({
        title: r.title,
        url: r.url,
        description: r.description,
      })) || [];

    return {
      success: true,
      data: {
        query,
        results,
        resultCount: results.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Search error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const webSearchTool: RegisteredTool = {
  definition: {
    name: "web_search",
    description:
      "Search the web for information, articles, and sources. Use this to find relevant academic content, news, and reference materials.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant web content",
        },
        count: {
          type: "number",
          description: "Number of results to return (default: 10, max: 20)",
        },
      },
      required: ["query"],
    },
  },
  execute: executeWebSearch,
};
