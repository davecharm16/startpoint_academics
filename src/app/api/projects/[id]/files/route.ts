import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface FileRow {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  is_deliverable: boolean;
  created_at: string;
  profiles: { full_name: string } | null;
}

// GET - List files for a project
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role and project access
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify project access
    const adminClient = createAdminClient();
    const { data: projectData } = await adminClient
      .from("projects")
      .select("id, writer_id")
      .eq("id", projectId)
      .single();

    const project = projectData as { id: string; writer_id: string | null } | null;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Writers can only access their own projects
    if (profile.role === "writer" && project.writer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get files with uploader info
    const { data: filesData, error } = await adminClient
      .from("project_files")
      .select(`
        id,
        project_id,
        uploaded_by,
        file_name,
        file_size,
        file_type,
        storage_path,
        is_deliverable,
        created_at,
        profiles!project_files_uploaded_by_fkey (full_name)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const files = filesData as FileRow[] | null;

    return NextResponse.json(files || []);
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// POST - Upload a file
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user role
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify project access
    const adminClient = createAdminClient();
    const { data: projectData } = await adminClient
      .from("projects")
      .select("id, writer_id, status")
      .eq("id", projectId)
      .single();

    const project = projectData as { id: string; writer_id: string | null; status: string } | null;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Writers can only upload to their assigned projects
    if (profile.role === "writer" && project.writer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow uploads for active projects
    const activeStatuses = ["assigned", "in_progress", "review"];
    if (!activeStatuses.includes(project.status) && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Cannot upload files to completed or cancelled projects" },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Create storage path: projectId/timestamp-filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${projectId}/${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await adminClient.storage
      .from("project-files")
      .upload(storagePath, file, {
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

    // Create database record
    const { data: fileRecord, error: dbError } = await (
      adminClient.from("project_files") as ReturnType<typeof adminClient.from>
    ).insert({
      project_id: projectId,
      uploaded_by: user.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_path: storagePath,
      is_deliverable: true,
    } as never).select().single();

    if (dbError) {
      // Clean up uploaded file if DB insert fails
      await adminClient.storage.from("project-files").remove([storagePath]);
      throw dbError;
    }

    // Log the upload in project history
    await (adminClient.from("project_history") as ReturnType<typeof adminClient.from>).insert({
      project_id: projectId,
      action: "file_uploaded",
      notes: `File uploaded: ${file.name}`,
      performed_by: user.id,
    } as never);

    return NextResponse.json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
