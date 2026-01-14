import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// GET /api/agent/sessions - List writer's sessions
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
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build query
  let query = agentDb(supabase)
    .from("writer_agent_sessions")
    .select(
      `
      *,
      projects (
        id,
        reference_code,
        topic,
        status
      )
    `,
      { count: "exact" }
    )
    .eq("writer_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: sessions, error, count } = await query;

  if (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    sessions,
    total: count,
    limit,
    offset,
  });
}

// POST /api/agent/sessions - Create a new session
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
    const { projectId, title } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify writer is assigned to this project
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, status, writer_id, topic")
      .eq("id", projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData as { id: string; status: string; writer_id: string | null; topic: string };

    if (project.writer_id !== user.id) {
      return NextResponse.json(
        { error: "You are not assigned to this project" },
        { status: 403 }
      );
    }

    // Check project status
    const allowedStatuses = ["assigned", "in_progress", "review", "revision"];
    if (!allowedStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: `Cannot create session for project with status "${project.status}"` },
        { status: 400 }
      );
    }

    // Create session
    const { data: session, error: createError } = await agentDb(supabase)
      .from("writer_agent_sessions")
      .insert({
        writer_id: user.id,
        project_id: projectId,
        title: title || `Session for ${project.topic}`,
        status: "active",
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating session:", createError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Update daily usage session count
    const today = new Date().toISOString().split("T")[0];
    await agentDb(supabase).rpc("upsert_daily_usage_session_count", {
      p_writer_id: user.id,
      p_date: today,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
