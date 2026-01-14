import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

interface RouteContext {
  params: Promise<{ draftId: string }>;
}

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// GET /api/agent/drafts/[draftId] - Get a specific draft
export async function GET(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: draft, error } = await agentDb(supabase)
    .from("agent_drafts")
    .select(
      `
      *,
      projects (
        id,
        reference_code,
        topic,
        status
      )
    `
    )
    .eq("id", draftId)
    .eq("writer_id", user.id)
    .single();

  if (error || !draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

// PATCH /api/agent/drafts/[draftId] - Update a draft
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
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
    const { title, content } = body;

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updates.title = title;
    }

    if (content !== undefined) {
      updates.content = content;
    }

    const { data: draft, error } = await agentDb(supabase)
      .from("agent_drafts")
      .update(updates)
      .eq("id", draftId)
      .eq("writer_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating draft:", error);
      return NextResponse.json(
        { error: "Failed to update draft" },
        { status: 500 }
      );
    }

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Draft update error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/agent/drafts/[draftId] - Delete a draft
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await agentDb(supabase)
    .from("agent_drafts")
    .delete()
    .eq("id", draftId)
    .eq("writer_id", user.id);

  if (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
