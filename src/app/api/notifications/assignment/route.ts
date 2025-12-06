import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { notifyWriterAssigned } from "@/lib/email/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, writerId } = body;

    if (!projectId || !writerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRouteClient();

    // Fetch project details
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select(`
        id,
        reference_code,
        tracking_token,
        client_email,
        client_name,
        topic,
        deadline,
        requirements,
        special_instructions,
        writer_share,
        packages!projects_package_id_fkey (name)
      `)
      .eq("id", projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectData as {
      id: string;
      reference_code: string;
      tracking_token: string;
      client_email: string;
      client_name: string;
      topic: string;
      deadline: string;
      requirements: string;
      special_instructions: string | null;
      writer_share: number;
      packages: { name: string } | null;
    };

    // Fetch writer details
    const { data: writerData, error: writerError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", writerId)
      .single();

    if (writerError || !writerData) {
      return NextResponse.json(
        { error: "Writer not found" },
        { status: 404 }
      );
    }

    const writer = writerData as {
      id: string;
      full_name: string;
      email: string;
    };

    // Parse requirements for email
    let requirementsText = "";
    try {
      const parsed = JSON.parse(project.requirements);
      if (parsed.expected_outputs) {
        requirementsText = parsed.expected_outputs;
      }
    } catch {
      requirementsText = project.requirements || "";
    }

    // Send notifications
    await notifyWriterAssigned({
      clientEmail: project.client_email,
      clientName: project.client_name,
      writerEmail: writer.email,
      writerName: writer.full_name,
      referenceCode: project.reference_code,
      trackingToken: project.tracking_token,
      topic: project.topic,
      packageName: project.packages?.name || "Academic Service",
      deadline: new Date(project.deadline),
      requirements: requirementsText,
      specialInstructions: project.special_instructions,
      writerShare: project.writer_share,
      projectId: project.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assignment notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
