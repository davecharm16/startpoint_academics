import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ImageRun,
  Packer,
  WidthType,
} from "docx";

/**
 * TipTap node types we handle
 */
interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
}

interface TipTapDocument {
  type: "doc";
  content: TipTapNode[];
}

/**
 * Export options
 */
export interface ExportOptions {
  title?: string;
  author?: string;
  includePageNumbers?: boolean;
  fontSize?: number;
  lineSpacing?: number;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

const DEFAULT_OPTIONS: ExportOptions = {
  fontSize: 12,
  lineSpacing: 1.5,
  includePageNumbers: true,
  margins: {
    top: 1440, // 1 inch in twips (1440 twips = 1 inch)
    bottom: 1440,
    left: 1440,
    right: 1440,
  },
};

/**
 * Convert TipTap JSON to DOCX document
 */
export async function generateDocx(
  document: TipTapDocument,
  options: ExportOptions = {}
): Promise<Uint8Array> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const children = await processNodes(document.content || [], opts);

  const doc = new Document({
    creator: opts.author || "Startpoint Academics",
    title: opts.title || "Document",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: opts.margins?.top || 1440,
              bottom: opts.margins?.bottom || 1440,
              left: opts.margins?.left || 1440,
              right: opts.margins?.right || 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/**
 * Process TipTap nodes into DOCX elements
 */
async function processNodes(
  nodes: TipTapNode[],
  options: ExportOptions
): Promise<(Paragraph | Table)[]> {
  const elements: (Paragraph | Table)[] = [];

  for (const node of nodes) {
    const element = await processNode(node, options);
    if (element) {
      if (Array.isArray(element)) {
        elements.push(...element);
      } else {
        elements.push(element);
      }
    }
  }

  return elements;
}

/**
 * Process a single TipTap node
 */
async function processNode(
  node: TipTapNode,
  options: ExportOptions
): Promise<Paragraph | Table | (Paragraph | Table)[] | null> {
  switch (node.type) {
    case "paragraph":
      return processParagraph(node, options);

    case "heading":
      return processHeading(node, options);

    case "bulletList":
    case "orderedList":
      return processList(node, options, node.type === "orderedList");

    case "blockquote":
      return processBlockquote(node, options);

    case "table":
      return processTable(node, options);

    case "image":
      return processImage(node, options);

    case "horizontalRule":
      return new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "999999",
          },
        },
      });

    case "hardBreak":
      return new Paragraph({});

    default:
      // Unknown node type, try to process children
      if (node.content) {
        return processNodes(node.content, options);
      }
      return null;
  }
}

/**
 * Process a paragraph node
 */
function processParagraph(
  node: TipTapNode,
  options: ExportOptions
): Paragraph {
  const textRuns = processInlineContent(node.content || [], options);

  return new Paragraph({
    spacing: {
      line: (options.lineSpacing || 1.5) * 240, // 240 twips per line
    },
    children: textRuns,
  });
}

/**
 * Process a heading node
 */
function processHeading(node: TipTapNode, options: ExportOptions): Paragraph {
  const level = (node.attrs?.level as number) || 1;
  const textRuns = processInlineContent(node.content || [], options);

  const headingLevels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
    4: HeadingLevel.HEADING_4,
    5: HeadingLevel.HEADING_5,
    6: HeadingLevel.HEADING_6,
  };

  return new Paragraph({
    heading: headingLevels[level] || HeadingLevel.HEADING_1,
    children: textRuns,
  });
}

/**
 * Process list nodes
 */
function processList(
  node: TipTapNode,
  options: ExportOptions,
  ordered: boolean
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let index = 1;

  for (const item of node.content || []) {
    if (item.type === "listItem") {
      const textRuns = processInlineContent(
        item.content?.[0]?.content || [],
        options
      );

      paragraphs.push(
        new Paragraph({
          bullet: ordered
            ? undefined
            : {
                level: 0,
              },
          numbering: ordered
            ? {
                reference: "default-numbering",
                level: 0,
              }
            : undefined,
          children: textRuns,
        })
      );
      index++;
    }
  }

  return paragraphs;
}

/**
 * Process blockquote node
 */
function processBlockquote(
  node: TipTapNode,
  options: ExportOptions
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const child of node.content || []) {
    if (child.type === "paragraph") {
      const textRuns = processInlineContent(child.content || [], options);
      paragraphs.push(
        new Paragraph({
          indent: { left: 720 }, // 0.5 inch indent
          border: {
            left: {
              style: BorderStyle.SINGLE,
              size: 12,
              color: "CCCCCC",
            },
          },
          children: textRuns,
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Process table node
 */
function processTable(node: TipTapNode, options: ExportOptions): Table {
  const rows: TableRow[] = [];

  for (const row of node.content || []) {
    if (row.type === "tableRow") {
      const cells: TableCell[] = [];

      for (const cell of row.content || []) {
        if (cell.type === "tableCell" || cell.type === "tableHeader") {
          const textRuns = processInlineContent(
            cell.content?.[0]?.content || [],
            options
          );

          cells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: textRuns,
                }),
              ],
              shading:
                cell.type === "tableHeader"
                  ? { fill: "E0E0E0" }
                  : undefined,
            })
          );
        }
      }

      rows.push(new TableRow({ children: cells }));
    }
  }

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

/**
 * Process image node
 */
async function processImage(
  node: TipTapNode,
  options: ExportOptions
): Promise<Paragraph | null> {
  const src = node.attrs?.src as string;
  const alt = (node.attrs?.alt as string) || "";

  if (!src) return null;

  try {
    // Fetch image data
    const response = await fetch(src);
    if (!response.ok) {
      // Return placeholder if image can't be fetched
      return new Paragraph({
        children: [new TextRun({ text: `[Image: ${alt}]`, italics: true })],
      });
    }

    const buffer = await response.arrayBuffer();

    return new Paragraph({
      children: [
        new ImageRun({
          data: buffer,
          transformation: {
            width: 400,
            height: 300,
          },
          type: "png", // Will be detected from buffer
        }),
      ],
      alignment: AlignmentType.CENTER,
    });
  } catch {
    // Return placeholder on error
    return new Paragraph({
      children: [new TextRun({ text: `[Image: ${alt}]`, italics: true })],
    });
  }
}

/**
 * Build text run options from marks
 */
function buildTextRunOptions(
  text: string,
  marks: Array<{ type: string; attrs?: Record<string, unknown> }>,
  fontSize: number
): ConstructorParameters<typeof TextRun>[0] {
  let bold = false;
  let italics = false;
  let underline: object | undefined = undefined;
  let strike = false;
  let font: string | undefined = undefined;
  let shading: { fill: string } | undefined = undefined;
  let color: string | undefined = undefined;
  let subScript = false;
  let superScript = false;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        bold = true;
        break;
      case "italic":
        italics = true;
        break;
      case "underline":
        underline = {};
        break;
      case "strike":
        strike = true;
        break;
      case "code":
        font = "Courier New";
        shading = { fill: "F0F0F0" };
        break;
      case "link":
        color = "0000FF";
        underline = {};
        break;
      case "subscript":
        subScript = true;
        break;
      case "superscript":
        superScript = true;
        break;
    }
  }

  return {
    text,
    size: fontSize * 2, // Half-points
    bold,
    italics,
    underline,
    strike,
    font,
    shading,
    color,
    subScript,
    superScript,
  };
}

/**
 * Process inline content (text with marks)
 */
function processInlineContent(
  nodes: TipTapNode[],
  options: ExportOptions
): TextRun[] {
  const textRuns: TextRun[] = [];
  const fontSize = options.fontSize || 12;

  for (const node of nodes) {
    if (node.type === "text" && node.text) {
      const runOptions = buildTextRunOptions(
        node.text,
        node.marks || [],
        fontSize
      );
      textRuns.push(new TextRun(runOptions));
    } else if (node.type === "hardBreak") {
      textRuns.push(new TextRun({ break: 1 }));
    }
  }

  return textRuns;
}
