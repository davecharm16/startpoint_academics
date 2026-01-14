import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";
import { createAdminClient } from "@startpoint/supabase/admin";
import {
  runAgent,
  checkUsageLimits,
  getDailyResetTime,
  getWeeklyResetTime,
  DEFAULT_LIMITS,
  type UsageStats,
  type ProjectInfo,
  type ProjectContext,
  type MessageParam,
} from "@startpoint/ai";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// Type for session data (table may not exist yet in database types)
interface SessionRow {
  id: string;
  writer_id: string;
  project_id: string;
  status: string;
  total_input_tokens: number;
  total_output_tokens: number;
  projects: {
    id: string;
    topic: string;
    requirements: string;
    deadline: string;
    status: string;
    writer_id: string | null;
  } | null;
}

// POST /api/agent/sessions/[sessionId]/messages - Send a message and get streaming response
export async function POST(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get session with project details
    const { data: sessionData, error: sessionError } = await agentDb(supabase)
      .from("writer_agent_sessions")
      .select(
        `
        *,
        projects (
          id,
          topic,
          requirements,
          deadline,
          status,
          writer_id
        )
      `
      )
      .eq("id", sessionId)
      .eq("writer_id", user.id)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionData as SessionRow;

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is not active" },
        { status: 400 }
      );
    }

    const project = session.projects;

    if (!project) {
      return NextResponse.json(
        { error: "Session has no associated project" },
        { status: 400 }
      );
    }

    // Get usage stats
    const today = new Date().toISOString().split("T")[0];
    const weekStart = getWeekStart();

    const { data: dailyUsage } = await agentDb(supabase)
      .from("writer_usage_daily")
      .select("total_tokens")
      .eq("writer_id", user.id)
      .eq("date", today)
      .single();

    const { data: weeklyUsage } = await agentDb(supabase)
      .from("writer_usage_daily")
      .select("total_tokens")
      .eq("writer_id", user.id)
      .gte("date", weekStart)
      .lte("date", today);

    const weeklyTokens =
      weeklyUsage?.reduce(
        (sum: number, d: { total_tokens?: number }) => sum + (d.total_tokens || 0),
        0
      ) || 0;

    const usageStats: UsageStats = {
      dailyTokens: dailyUsage?.total_tokens || 0,
      weeklyTokens,
      sessionTokens: session.total_input_tokens + session.total_output_tokens,
      dailyResetAt: getDailyResetTime(),
      weeklyResetAt: getWeeklyResetTime(),
    };

    // Check usage limits before proceeding
    const usageCheck = checkUsageLimits(usageStats, DEFAULT_LIMITS);
    if (!usageCheck.allowed) {
      // Log blocked attempt
      await agentDb(supabaseAdmin).from("agent_blocked_attempts").insert({
        writer_id: user.id,
        session_id: sessionId,
        reason: usageCheck.reason || "Usage limit exceeded",
        category: "usage_limit",
        message_snippet: message.substring(0, 100),
      });

      return NextResponse.json(
        {
          error: usageCheck.reason,
          remaining: usageCheck.remaining,
          resetTimes: usageCheck.resetTimes,
        },
        { status: 429 }
      );
    }

    // Get conversation history
    const { data: previousMessages } = await agentDb(supabase)
      .from("agent_messages")
      .select("role, content, tool_name, tool_input, tool_result")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    // Convert to Anthropic message format
    interface PreviousMessage {
      role: string;
      content: string | null;
      tool_name: string | null;
      tool_input: unknown;
      tool_result: unknown;
    }
    const conversationHistory: MessageParam[] = (
      (previousMessages || []) as PreviousMessage[]
    )
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content || "",
      }));

    // Save user message
    const { error: userMsgError } = await agentDb(supabaseAdmin)
      .from("agent_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: message,
      });

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError);
    }

    // Prepare project context
    const projectInfo: ProjectInfo = {
      id: project.id,
      status: project.status as "assigned" | "in_progress" | "review" | "revision",
      writerId: project.writer_id,
      deadline: project.deadline,
    };

    const projectContext: ProjectContext = {
      topic: project.topic,
      description: project.requirements,
    };

    // Run agent
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const agentResponse = await runAgent(
            message,
            {
              sessionId,
              projectId: project.id,
              writerId: user.id,
              project: projectInfo,
              projectContext,
              usageStats,
              conversationHistory,
            },
            {},
            (event) => {
              // Stream events to client
              const data = JSON.stringify(event) + "\n";
              controller.enqueue(encoder.encode(`data: ${data}\n`));
            }
          );

          // Save assistant message
          await agentDb(supabaseAdmin).from("agent_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: agentResponse.content,
            input_tokens: Math.floor((agentResponse.tokensUsed || 0) * 0.3),
            output_tokens: Math.floor((agentResponse.tokensUsed || 0) * 0.7),
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          // Log blocked attempt if it's a guardrail block
          if (
            errorMessage.includes("blocked") ||
            errorMessage.includes("limit")
          ) {
            await agentDb(supabaseAdmin).from("agent_blocked_attempts").insert({
              writer_id: user.id,
              session_id: sessionId,
              reason: errorMessage,
              category: errorMessage.includes("limit")
                ? "usage_limit"
                : "content_filter",
              message_snippet: message.substring(0, 100),
            });
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  return monday.toISOString().split("T")[0];
}
