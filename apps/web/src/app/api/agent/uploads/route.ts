import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// GET /api/agent/uploads - List uploads for a session
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  // Verify session ownership
  const { data: session, error: sessionError } = await agentDb(supabase)
    .from("writer_agent_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("writer_id", user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: uploads, error } = await agentDb(supabase)
    .from("agent_uploads")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    );
  }

  return NextResponse.json({ uploads });
}

// POST /api/agent/uploads - Upload a file
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify session ownership
    const { data: sessionData, error: sessionError } = await agentDb(supabase)
      .from("writer_agent_sessions")
      .select("id, status")
      .eq("id", sessionId)
      .eq("writer_id", user.id)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionData as { id: string; status: string };

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Cannot upload to inactive session" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP",
        },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${sessionId}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("agent-uploads")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("agent-uploads").getPublicUrl(storagePath);

    // Create database record
    const { data: upload, error: dbError } = await agentDb(supabase)
      .from("agent_uploads")
      .insert({
        session_id: sessionId,
        writer_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from("agent-uploads").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save upload record" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        upload: {
          ...upload,
          url: publicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
