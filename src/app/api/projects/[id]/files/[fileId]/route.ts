import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string; fileId: string }>;
}

interface FileRow {
  id: string;
  project_id: string;
  uploaded_by: string;
  file_name: string;
  storage_path: string;
}

interface ProjectRow {
  id: string;
  writer_id: string | null;
  status: string;
}

// GET - Download a file (returns signed URL)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, fileId } = await context.params;
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

    const adminClient = createAdminClient();

    // Get file record
    const { data: fileData } = await adminClient
      .from("project_files")
      .select("id, project_id, uploaded_by, file_name, storage_path")
      .eq("id", fileId)
      .eq("project_id", projectId)
      .single();

    const file = fileData as FileRow | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Verify project access
    const { data: projectData } = await adminClient
      .from("projects")
      .select("id, writer_id, status")
      .eq("id", projectId)
      .single();

    const project = projectData as ProjectRow | null;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Writers can only access their own projects
    if (profile.role === "writer" && project.writer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrl, error: signError } = await adminClient.storage
      .from("project-files")
      .createSignedUrl(file.storage_path, 3600, {
        download: file.file_name,
      });

    if (signError || !signedUrl) {
      console.error("Signed URL error:", signError);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrl.signedUrl,
      fileName: file.file_name,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a file
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId, fileId } = await context.params;
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

    const adminClient = createAdminClient();

    // Get file record
    const { data: fileData } = await adminClient
      .from("project_files")
      .select("id, project_id, uploaded_by, file_name, storage_path")
      .eq("id", fileId)
      .eq("project_id", projectId)
      .single();

    const file = fileData as FileRow | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Writers can only delete their own uploads
    if (profile.role === "writer" && file.uploaded_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from storage
    const { error: storageError } = await adminClient.storage
      .from("project-files")
      .remove([file.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue anyway - file might already be deleted
    }

    // Delete database record
    const { error: dbError } = await adminClient
      .from("project_files")
      .delete()
      .eq("id", fileId);

    if (dbError) throw dbError;

    // Log the deletion in project history
    await (adminClient.from("project_history") as ReturnType<typeof adminClient.from>).insert({
      project_id: projectId,
      action: "file_deleted",
      notes: `File deleted: ${file.file_name}`,
      performed_by: user.id,
    } as never);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
