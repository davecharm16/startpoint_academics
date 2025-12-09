import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface ProjectRow {
  id: string;
  status: string;
}

interface FileRow {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  created_at: string;
}

// GET - List files for a project (client access via tracking token)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
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

    // Only show files for completed projects
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

    // Get files
    const { data: filesData, error } = await adminClient
      .from("project_files")
      .select(`
        id,
        file_name,
        file_size,
        file_type,
        storage_path,
        created_at
      `)
      .eq("project_id", project.id)
      .eq("is_deliverable", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const files = filesData as FileRow[] | null;

    return NextResponse.json(files || []);
  } catch (error) {
    console.error("Get client files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
