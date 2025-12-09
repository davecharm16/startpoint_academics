import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

interface RouteContext {
  params: Promise<{ token: string; fileId: string }>;
}

interface ProjectRow {
  id: string;
  status: string;
}

interface FileRow {
  id: string;
  project_id: string;
  file_name: string;
  storage_path: string;
}

// GET - Download a file (client access via tracking token)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token, fileId } = await context.params;
    const adminClient = createAdminClient();

    // Find project by tracking token
    const { data: projectData } = await adminClient
      .from("projects")
      .select("id, status")
      .eq("tracking_token", token)
      .single();

    const project = projectData as ProjectRow | null;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only allow downloads for completed projects
    const completedStatuses = ["complete", "paid"];
    if (!completedStatuses.includes(project.status)) {
      return NextResponse.json({
        error: "Files are only available after project completion"
      }, { status: 403 });
    }

    // Verify PIN verification
    const cookieStore = await cookies();
    const verificationCookie = cookieStore.get(`track_verified_${project.id}`);

    if (verificationCookie?.value !== "true") {
      return NextResponse.json({
        error: "PIN verification required"
      }, { status: 401 });
    }

    // Get file record
    const { data: fileData } = await adminClient
      .from("project_files")
      .select("id, project_id, file_name, storage_path")
      .eq("id", fileId)
      .eq("project_id", project.id)
      .single();

    const file = fileData as FileRow | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
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
    console.error("Client download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
