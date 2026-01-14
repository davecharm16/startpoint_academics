import * as cheerio from "cheerio";
import type { RegisteredTool, ToolResult, ToolContext } from "./types";

/**
 * Scrape and extract content from a URL
 */
async function executeWebScrape(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const url = input.url as string;

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false,
        error: "Only HTTP and HTTPS URLs are supported",
      };
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; StartpointBot/1.0; +https://startpointacademics.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        success: false,
        error: `Unsupported content type: ${contentType}. Only HTML pages can be scraped.`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, and other non-content elements
    $("script, style, nav, footer, header, aside, iframe, noscript").remove();

    // Extract metadata
    const title = $("title").text().trim() || $("h1").first().text().trim();
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";
    const author =
      $('meta[name="author"]').attr("content") ||
      $('[rel="author"]').text().trim() ||
      "";
    const publishedDate =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").first().attr("datetime") ||
      "";

    // Extract main content
    // Try common content selectors
    let content = "";
    const contentSelectors = [
      "article",
      '[role="main"]',
      "main",
      ".post-content",
      ".article-content",
      ".entry-content",
      "#content",
      ".content",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback to body if no content container found
    if (!content) {
      content = $("body").text().trim();
    }

    // Clean up content - remove excessive whitespace
    content = content
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    // Truncate if too long (keep first 10000 chars for context)
    const maxLength = 10000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + "... [content truncated]";
    }

    return {
      success: true,
      data: {
        url,
        title,
        description,
        author,
        publishedDate,
        content,
        contentLength: content.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Scrape error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const webScrapeTool: RegisteredTool = {
  definition: {
    name: "scrape_url",
    description:
      "Extract the main content from a web page URL. Use this after web_search to get full article content from specific URLs.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The URL of the web page to scrape",
        },
      },
      required: ["url"],
    },
  },
  execute: executeWebScrape,
};
