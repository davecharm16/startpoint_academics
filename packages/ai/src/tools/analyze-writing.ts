import type { RegisteredTool, ToolResult, ToolContext } from "./types";
import { getClient, models } from "../client";

type AnalysisType =
  | "grammar"
  | "style"
  | "clarity"
  | "academic"
  | "plagiarism_risk"
  | "full";

interface AnalysisResult {
  type: AnalysisType;
  score?: number;
  issues: Array<{
    type: string;
    severity: "error" | "warning" | "suggestion";
    location?: string;
    original?: string;
    suggestion?: string;
    explanation: string;
  }>;
  summary: string;
  recommendations: string[];
}

/**
 * Analyze writing for grammar, style, clarity, and academic quality
 */
async function executeAnalyzeWriting(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<ToolResult> {
  const text = input.text as string;
  const analysisType = (input.analysisType as AnalysisType) || "full";
  const academicLevel = (input.academicLevel as string) || "undergraduate";

  if (!text) {
    return {
      success: false,
      error: "Text is required for analysis",
    };
  }

  if (text.length < 50) {
    return {
      success: false,
      error: "Text is too short for meaningful analysis. Please provide at least 50 characters.",
    };
  }

  try {
    const client = getClient();

    const analysisPrompt = buildAnalysisPrompt(analysisType, academicLevel, text);

    const response = await client.messages.create({
      model: models.assistant,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the structured response
    const analysis = parseAnalysisResponse(responseText, analysisType);

    return {
      success: true,
      data: {
        analysis,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Analysis error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

function buildAnalysisPrompt(
  type: AnalysisType,
  level: string,
  text: string
): string {
  const basePrompt = `Analyze the following text for a ${level} level academic paper. Provide your analysis in JSON format.

TEXT TO ANALYZE:
"""
${text}
"""

`;

  const typeInstructions: Record<AnalysisType, string> = {
    grammar: `Focus on grammatical errors, punctuation, and sentence structure issues.`,
    style: `Focus on writing style, tone, word choice, and readability.`,
    clarity: `Focus on clarity, coherence, logical flow, and argument structure.`,
    academic: `Focus on academic writing conventions, formal tone, and scholarly language.`,
    plagiarism_risk: `Identify phrases that may appear too generic, clichéd, or potentially problematic for plagiarism detection.`,
    full: `Provide a comprehensive analysis including grammar, style, clarity, and academic quality.`,
  };

  return (
    basePrompt +
    typeInstructions[type] +
    `

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "issues": [
    {
      "type": "<grammar|style|clarity|academic|plagiarism_risk>",
      "severity": "<error|warning|suggestion>",
      "location": "<quote the problematic text>",
      "suggestion": "<corrected version if applicable>",
      "explanation": "<brief explanation>"
    }
  ],
  "summary": "<2-3 sentence overall assessment>",
  "recommendations": ["<specific improvement suggestion>", "..."]
}`
  );
}

function parseAnalysisResponse(
  response: string,
  type: AnalysisType
): AnalysisResult {
  try {
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());

    return {
      type,
      score: parsed.score,
      issues: parsed.issues || [],
      summary: parsed.summary || "Analysis complete.",
      recommendations: parsed.recommendations || [],
    };
  } catch {
    // If JSON parsing fails, create a basic response from the text
    return {
      type,
      issues: [],
      summary: response.substring(0, 500),
      recommendations: ["Review the full analysis above."],
    };
  }
}

export const analyzeWritingTool: RegisteredTool = {
  definition: {
    name: "analyze_writing",
    description:
      "Analyze text for grammar, style, clarity, and academic quality. Provides detailed feedback with specific issues and recommendations.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: {
          type: "string",
          description: "The text to analyze",
        },
        analysisType: {
          type: "string",
          enum: ["grammar", "style", "clarity", "academic", "plagiarism_risk", "full"],
          description:
            "Type of analysis to perform. Default: 'full' for comprehensive analysis.",
        },
        academicLevel: {
          type: "string",
          enum: ["high_school", "undergraduate", "graduate", "doctoral"],
          description:
            "Academic level to evaluate against. Default: 'undergraduate'",
        },
      },
      required: ["text"],
    },
  },
  execute: executeAnalyzeWriting,
};
