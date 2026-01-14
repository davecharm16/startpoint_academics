import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// GET /api/agent/sessions/[sessionId] - Get a specific session
export async function GET(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session, error } = await agentDb(supabase)
    .from("writer_agent_sessions")
    .select(
      `
      *,
      projects (
        id,
        reference_code,
        topic,
        status,
        requirements,
        deadline
      ),
      agent_messages (
        id,
        role,
        content,
        tool_name,
        tool_input,
        tool_result,
        input_tokens,
        output_tokens,
        created_at
      )
    `
    )
    .eq("id", sessionId)
    .eq("writer_id", user.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}

// PATCH /api/agent/sessions/[sessionId] - Update a session
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, status } = body;

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updates.title = title;
    }

    if (status !== undefined) {
      if (!["active", "closed", "archived"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be: active, closed, or archived" },
          { status: 400 }
        );
      }
      updates.status = status;
      if (status === "closed") {
        updates.closed_at = new Date().toISOString();
      }
    }

    const { data: session, error } = await agentDb(supabase)
      .from("writer_agent_sessions")
      .update(updates)
      .eq("id", sessionId)
      .eq("writer_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/agent/sessions/[sessionId] - Archive a session
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { sessionId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft delete - archive the session
  const { error } = await agentDb(supabase)
    .from("writer_agent_sessions")
    .update({
      status: "archived",
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("writer_id", user.id);

  if (error) {
    console.error("Error archiving session:", error);
    return NextResponse.json(
      { error: "Failed to archive session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
