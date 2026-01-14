import { getClient, models } from "../client";

/**
 * Content filter result
 */
export interface ContentFilterResult {
  allowed: boolean;
  reason?: string;
  category?: "on_topic" | "off_topic" | "inappropriate" | "unclear";
  confidence: number;
}

/**
 * Project context for relevance checking
 */
export interface ProjectContext {
  topic: string;
  description?: string;
  packageType?: string;
}

/**
 * Quick check patterns for obvious off-topic content
 * These bypass the AI check for efficiency
 */
const OFF_TOPIC_PATTERNS = [
  /write.*code|coding|programming|software/i,
  /hack|exploit|vulnerability/i,
  /illegal|drug|weapon/i,
  /personal.*relationship|dating|romance/i,
  /gambling|casino|betting/i,
  /make.*money.*fast|get.*rich.*quick/i,
];

/**
 * Quick check patterns for obviously on-topic content
 */
const ON_TOPIC_PATTERNS = [
  /essay|paper|thesis|dissertation/i,
  /research|study|analysis|literature/i,
  /citation|reference|bibliography/i,
  /paragraph|introduction|conclusion/i,
  /academic|scholarly|peer-reviewed/i,
  /write|draft|edit|revise/i,
  /grammar|style|format/i,
];

/**
 * Check if a message is relevant to academic writing
 * Uses a fast pattern check first, then AI filter if needed
 */
export async function filterContent(
  message: string,
  projectContext?: ProjectContext
): Promise<ContentFilterResult> {
  // Quick pattern-based checks
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason:
          "This appears to be off-topic. The writing assistant is designed for academic writing tasks only.",
        category: "off_topic",
        confidence: 0.9,
      };
    }
  }

  // Check for obviously on-topic content
  for (const pattern of ON_TOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return {
        allowed: true,
        category: "on_topic",
        confidence: 0.9,
      };
    }
  }

  // Short messages are usually commands or quick questions - allow them
  if (message.length < 50) {
    return {
      allowed: true,
      category: "on_topic",
      confidence: 0.7,
    };
  }

  // Use Claude Haiku for fast relevance check
  try {
    const client = getClient();

    const prompt = buildFilterPrompt(message, projectContext);

    const response = await client.messages.create({
      model: models.filter,
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text"
        ? response.content[0].text.toLowerCase()
        : "";

    // Parse the response
    if (responseText.includes("off_topic")) {
      return {
        allowed: false,
        reason:
          "This message doesn't appear to be related to academic writing. Please keep requests focused on your writing project.",
        category: "off_topic",
        confidence: 0.8,
      };
    }

    if (responseText.includes("inappropriate")) {
      return {
        allowed: false,
        reason:
          "This request cannot be processed. Please keep requests appropriate for academic writing.",
        category: "inappropriate",
        confidence: 0.9,
      };
    }

    return {
      allowed: true,
      category: "on_topic",
      confidence: 0.8,
    };
  } catch (error) {
    // On error, allow the message but log it
    console.error("Content filter error:", error);
    return {
      allowed: true,
      category: "unclear",
      confidence: 0.5,
    };
  }
}

function buildFilterPrompt(
  message: string,
  context?: ProjectContext
): string {
  let prompt = `Classify this user message for an academic writing assistant. Is it related to academic writing, research, or document creation?

MESSAGE: "${message.substring(0, 500)}"`;

  if (context?.topic) {
    prompt += `\n\nCURRENT PROJECT TOPIC: ${context.topic}`;
  }

  prompt += `

Respond with ONE word only:
- "on_topic" - if related to writing, research, citations, editing, or academic work
- "off_topic" - if unrelated to academic writing (e.g., coding, personal matters, other topics)
- "inappropriate" - if the request is harmful, illegal, or violates academic integrity

ONE WORD:`;

  return prompt;
}
