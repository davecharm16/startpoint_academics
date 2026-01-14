import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// GET /api/agent/drafts - List writer's drafts
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const sessionId = searchParams.get("sessionId");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build query
  let query = agentDb(supabase)
    .from("agent_drafts")
    .select(
      `
      id,
      title,
      word_count,
      is_exported,
      created_at,
      updated_at,
      project_id,
      session_id,
      projects (
        id,
        reference_code,
        topic
      )
    `,
      { count: "exact" }
    )
    .eq("writer_id", user.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data: drafts, error, count } = await query;

  if (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    drafts,
    total: count,
    limit,
    offset,
  });
}

// POST /api/agent/drafts - Create a new draft
export async function POST(request: NextRequest) {
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
    const { projectId, sessionId, title, content } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify writer is assigned to this project
    const { data: project, error: projectError } = await agentDb(supabase)
      .from("projects")
      .select("id, writer_id, topic")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = project as { id: string; writer_id: string | null; topic: string };

    if (projectData.writer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Create draft
    const { data: draft, error: createError } = await agentDb(supabase)
      .from("agent_drafts")
      .insert({
        writer_id: user.id,
        project_id: projectId,
        session_id: sessionId || null,
        title: title || `Draft for ${projectData.topic}`,
        content: content || { type: "doc", content: [] },
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating draft:", createError);
      return NextResponse.json(
        { error: "Failed to create draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    console.error("Draft creation error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
