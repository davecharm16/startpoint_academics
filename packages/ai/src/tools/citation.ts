import type { RegisteredTool, ToolResult, ToolContext } from "./types";

export type CitationStyle = "apa7" | "mla9" | "chicago" | "custom";

interface CitationSource {
  type: "article" | "book" | "website" | "journal";
  title: string;
  authors: string[];
  year?: number;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  accessDate?: string;
  doi?: string;
}

/**
 * Format author name for APA style (Last, F. M.)
 */
function formatAuthorAPA(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => p[0].toUpperCase() + ".")
    .join(" ");

  return `${lastName}, ${initials}`;
}

/**
 * Format author name for MLA style (Last, First Middle)
 */
function formatAuthorMLA(name: string, isFirst: boolean): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(" ");

  return isFirst ? `${lastName}, ${firstName}` : `${firstName} ${lastName}`;
}

/**
 * Format citation in APA 7th edition
 */
function formatAPA7(source: CitationSource): string {
  const authors =
    source.authors.length > 0
      ? source.authors.map(formatAuthorAPA).join(", ")
      : "Unknown Author";

  const year = source.year ? `(${source.year})` : "(n.d.)";

  let citation = `${authors} ${year}. `;

  switch (source.type) {
    case "journal":
    case "article":
      citation += `${source.title}. `;
      if (source.journal) {
        citation += `*${source.journal}*`;
        if (source.volume) citation += `, *${source.volume}*`;
        if (source.issue) citation += `(${source.issue})`;
        if (source.pages) citation += `, ${source.pages}`;
        citation += ". ";
      }
      if (source.doi) citation += `https://doi.org/${source.doi}`;
      else if (source.url) citation += source.url;
      break;

    case "book":
      citation += `*${source.title}*. `;
      if (source.publisher) citation += source.publisher + ".";
      break;

    case "website":
      citation += `${source.title}. `;
      if (source.publisher) citation += source.publisher + ". ";
      if (source.url) citation += source.url;
      break;
  }

  return citation.trim();
}

/**
 * Format citation in MLA 9th edition
 */
function formatMLA9(source: CitationSource): string {
  let authors = "";
  if (source.authors.length === 1) {
    authors = formatAuthorMLA(source.authors[0], true);
  } else if (source.authors.length === 2) {
    authors = `${formatAuthorMLA(source.authors[0], true)}, and ${formatAuthorMLA(source.authors[1], false)}`;
  } else if (source.authors.length > 2) {
    authors = `${formatAuthorMLA(source.authors[0], true)}, et al.`;
  }

  let citation = authors ? `${authors}. ` : "";

  switch (source.type) {
    case "journal":
    case "article":
      citation += `"${source.title}." `;
      if (source.journal) {
        citation += `*${source.journal}*`;
        if (source.volume) citation += `, vol. ${source.volume}`;
        if (source.issue) citation += `, no. ${source.issue}`;
        if (source.year) citation += `, ${source.year}`;
        if (source.pages) citation += `, pp. ${source.pages}`;
        citation += ". ";
      }
      if (source.doi) citation += `doi:${source.doi}.`;
      break;

    case "book":
      citation += `*${source.title}*. `;
      if (source.publisher) citation += source.publisher;
      if (source.year) citation += `, ${source.year}`;
      citation += ".";
      break;

    case "website":
      citation += `"${source.title}." `;
      if (source.publisher) citation += `*${source.publisher}*, `;
      if (source.accessDate) citation += `Accessed ${source.accessDate}. `;
      if (source.url) citation += source.url + ".";
      break;
  }

  return citation.trim();
}

/**
 * Format citation in Chicago style (author-date)
 */
function formatChicago(source: CitationSource): string {
  const authors =
    source.authors.length > 0
      ? source.authors.map((a, i) => formatAuthorMLA(a, i === 0)).join(", ")
      : "";

  const year = source.year || "n.d.";

  let citation = authors ? `${authors}. ` : "";
  citation += `${year}. `;

  switch (source.type) {
    case "journal":
    case "article":
      citation += `"${source.title}." `;
      if (source.journal) {
        citation += `*${source.journal}* `;
        if (source.volume) citation += source.volume;
        if (source.issue) citation += `, no. ${source.issue}`;
        if (source.pages) citation += `: ${source.pages}`;
        citation += ". ";
      }
      if (source.doi) citation += `https://doi.org/${source.doi}`;
      else if (source.url) citation += source.url;
      break;

    case "book":
      citation += `*${source.title}*. `;
      if (source.publisher) citation += source.publisher + ".";
      break;

    case "website":
      citation += `"${source.title}." `;
      if (source.publisher) citation += source.publisher + ". ";
      if (source.accessDate) citation += `Accessed ${source.accessDate}. `;
      if (source.url) citation += source.url + ".";
      break;
  }

  return citation.trim();
}

/**
 * Format citation in a custom style based on template
 */
function formatCustom(source: CitationSource, template: string): string {
  let citation = template;

  // Replace placeholders
  citation = citation.replace(/{authors}/g, source.authors.join(", "));
  citation = citation.replace(/{title}/g, source.title);
  citation = citation.replace(/{year}/g, source.year?.toString() || "n.d.");
  citation = citation.replace(/{journal}/g, source.journal || "");
  citation = citation.replace(/{publisher}/g, source.publisher || "");
  citation = citation.replace(/{volume}/g, source.volume || "");
  citation = citation.replace(/{issue}/g, source.issue || "");
  citation = citation.replace(/{pages}/g, source.pages || "");
  citation = citation.replace(/{url}/g, source.url || "");
  citation = citation.replace(/{doi}/g, source.doi || "");
  citation = citation.replace(/{accessDate}/g, source.accessDate || "");

  // Clean up empty brackets and extra punctuation
  citation = citation.replace(/\(\)/g, "");
  citation = citation.replace(/\[\]/g, "");
  citation = citation.replace(/\s+/g, " ");
  citation = citation.replace(/,\s*,/g, ",");
  citation = citation.replace(/\.\s*\./g, ".");

  return citation.trim();
}

/**
 * Format a citation in the specified style
 */
async function executeCitation(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const style = (input.style as CitationStyle) || "apa7";
  const customTemplate = input.customTemplate as string | undefined;

  const source: CitationSource = {
    type: (input.sourceType as CitationSource["type"]) || "article",
    title: (input.title as string) || "",
    authors: (input.authors as string[]) || [],
    year: input.year as number | undefined,
    publisher: input.publisher as string | undefined,
    journal: input.journal as string | undefined,
    volume: input.volume as string | undefined,
    issue: input.issue as string | undefined,
    pages: input.pages as string | undefined,
    url: input.url as string | undefined,
    accessDate: input.accessDate as string | undefined,
    doi: input.doi as string | undefined,
  };

  if (!source.title) {
    return {
      success: false,
      error: "Title is required for citation",
    };
  }

  let formattedCitation: string;

  try {
    switch (style) {
      case "apa7":
        formattedCitation = formatAPA7(source);
        break;
      case "mla9":
        formattedCitation = formatMLA9(source);
        break;
      case "chicago":
        formattedCitation = formatChicago(source);
        break;
      case "custom":
        if (!customTemplate) {
          return {
            success: false,
            error: "Custom template is required when using custom style",
          };
        }
        formattedCitation = formatCustom(source, customTemplate);
        break;
      default:
        formattedCitation = formatAPA7(source);
    }

    return {
      success: true,
      data: {
        style,
        citation: formattedCitation,
        source,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Citation formatting error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const citationTool: RegisteredTool = {
  definition: {
    name: "format_citation",
    description:
      "Format a source citation in APA 7th, MLA 9th, Chicago, or a custom style. Provide source details and the desired format.",
    input_schema: {
      type: "object" as const,
      properties: {
        style: {
          type: "string",
          enum: ["apa7", "mla9", "chicago", "custom"],
          description: "Citation style to use (default: apa7)",
        },
        sourceType: {
          type: "string",
          enum: ["article", "book", "website", "journal"],
          description: "Type of source being cited",
        },
        title: {
          type: "string",
          description: "Title of the work",
        },
        authors: {
          type: "array",
          items: { type: "string" },
          description: "List of author names (e.g., ['John Smith', 'Jane Doe'])",
        },
        year: {
          type: "number",
          description: "Year of publication",
        },
        publisher: {
          type: "string",
          description: "Publisher name (for books) or website name",
        },
        journal: {
          type: "string",
          description: "Journal name (for articles)",
        },
        volume: {
          type: "string",
          description: "Volume number",
        },
        issue: {
          type: "string",
          description: "Issue number",
        },
        pages: {
          type: "string",
          description: "Page range (e.g., '123-145')",
        },
        url: {
          type: "string",
          description: "URL of the source",
        },
        doi: {
          type: "string",
          description: "DOI (Digital Object Identifier)",
        },
        accessDate: {
          type: "string",
          description: "Date accessed (for websites, e.g., 'January 15, 2024')",
        },
        customTemplate: {
          type: "string",
          description:
            "Custom template when style is 'custom'. Use placeholders: {authors}, {title}, {year}, {journal}, {volume}, {issue}, {pages}, {url}, {doi}",
        },
      },
      required: ["title"],
    },
  },
  execute: executeCitation,
};
