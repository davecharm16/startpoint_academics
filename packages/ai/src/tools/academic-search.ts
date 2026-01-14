import type { RegisteredTool, ToolResult, ToolContext } from "./types";

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  authors: Array<{ name: string }>;
  url: string;
  citationCount: number;
  venue: string | null;
  openAccessPdf?: { url: string } | null;
}

interface SemanticScholarResponse {
  data: SemanticScholarPaper[];
  total: number;
}

/**
 * Search academic papers using Semantic Scholar API
 */
async function executeAcademicSearch(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const query = input.query as string;
  const limit = Math.min((input.limit as number) || 10, 20);
  const yearFrom = input.yearFrom as number | undefined;
  const yearTo = input.yearTo as number | undefined;

  try {
    // Build query parameters
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      fields:
        "paperId,title,abstract,year,authors,url,citationCount,venue,openAccessPdf",
    });

    if (yearFrom || yearTo) {
      const yearRange = `${yearFrom || ""}-${yearTo || ""}`;
      params.append("year", yearRange);
    }

    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please wait a moment before searching again.",
        };
      }
      return {
        success: false,
        error: `Academic search failed: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as SemanticScholarResponse;

    const papers = data.data.map((paper) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      year: paper.year,
      authors: paper.authors.map((a) => a.name),
      url: paper.url,
      citations: paper.citationCount,
      venue: paper.venue,
      pdfUrl: paper.openAccessPdf?.url || null,
    }));

    return {
      success: true,
      data: {
        query,
        papers,
        total: data.total,
        resultCount: papers.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Academic search error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const academicSearchTool: RegisteredTool = {
  definition: {
    name: "search_academic",
    description:
      "Search academic papers and scholarly articles using Semantic Scholar. Returns peer-reviewed papers with abstracts, authors, and citation counts.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Academic search query (e.g., 'machine learning education')",
        },
        limit: {
          type: "number",
          description: "Number of papers to return (default: 10, max: 20)",
        },
        yearFrom: {
          type: "number",
          description: "Filter papers published from this year onwards",
        },
        yearTo: {
          type: "number",
          description: "Filter papers published up to this year",
        },
      },
      required: ["query"],
    },
  },
  execute: executeAcademicSearch,
};
