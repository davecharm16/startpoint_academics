import type { RegisteredTool, ToolResult, ToolContext } from "./types";
import { getClient, models } from "../client";
import pdfParse from "pdf-parse";

interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

/**
 * Read and extract content from an uploaded file
 * Supports PDFs (via pdf-parse) and images (via Claude Vision)
 */
async function executeFileRead(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const fileId = input.fileId as string;
  const fileUrl = input.fileUrl as string;
  const fileName = input.fileName as string;
  const fileType = input.fileType as string;

  if (!fileUrl) {
    return {
      success: false,
      error: "File URL is required",
    };
  }

  try {
    // Determine file type from mime type or extension
    const isImage =
      fileType?.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName || "");
    const isPdf =
      fileType === "application/pdf" || /\.pdf$/i.test(fileName || "");

    if (isImage) {
      // Use Claude Vision to analyze the image
      const client = getClient();

      // Fetch the image as base64
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch image: ${response.statusText}`,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Determine media type
      let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" =
        "image/jpeg";
      if (fileType === "image/png" || fileName?.endsWith(".png")) {
        mediaType = "image/png";
      } else if (fileType === "image/gif" || fileName?.endsWith(".gif")) {
        mediaType = "image/gif";
      } else if (fileType === "image/webp" || fileName?.endsWith(".webp")) {
        mediaType = "image/webp";
      }

      const visionResponse = await client.messages.create({
        model: models.assistant,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: "Please analyze this image and extract any text, data, charts, or relevant information. If it contains a document, transcribe the content. If it contains a chart or diagram, describe its contents and data.",
              },
            ],
          },
        ],
      });

      const extractedContent =
        visionResponse.content[0].type === "text"
          ? visionResponse.content[0].text
          : "";

      return {
        success: true,
        data: {
          fileId,
          fileName,
          fileType: "image",
          extractedContent,
          tokensUsed:
            visionResponse.usage.input_tokens +
            visionResponse.usage.output_tokens,
        },
      };
    } else if (isPdf) {
      // Use pdf-parse to extract text from PDF
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch PDF: ${response.statusText}`,
        };
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const pdfData = await pdfParse(buffer);

      // Truncate if too long
      let text = pdfData.text;
      const maxLength = 50000;
      if (text.length > maxLength) {
        text = text.substring(0, maxLength) + "\n\n[Content truncated...]";
      }

      return {
        success: true,
        data: {
          fileId,
          fileName,
          fileType: "pdf",
          extractedContent: text,
          pageCount: pdfData.numpages,
          metadata: pdfData.info,
        },
      };
    } else {
      return {
        success: false,
        error: `Unsupported file type: ${fileType || "unknown"}. Supported types: PDF, images (JPEG, PNG, GIF, WebP)`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `File read error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const fileReaderTool: RegisteredTool = {
  definition: {
    name: "read_uploaded_file",
    description:
      "Read and extract content from an uploaded file. Supports PDFs (extracts text) and images (uses AI vision to extract content, text, charts, and diagrams).",
    input_schema: {
      type: "object" as const,
      properties: {
        fileId: {
          type: "string",
          description: "The unique identifier of the uploaded file",
        },
        fileUrl: {
          type: "string",
          description: "The URL to access the file",
        },
        fileName: {
          type: "string",
          description: "The original name of the file",
        },
        fileType: {
          type: "string",
          description: "The MIME type of the file (e.g., 'application/pdf', 'image/png')",
        },
      },
      required: ["fileUrl"],
    },
  },
  execute: executeFileRead,
};
