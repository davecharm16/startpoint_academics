import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { notifyProjectCompletion } from "@/lib/email/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project ID" },
        { status: 400 }
      );
    }

    const supabase = createRouteClient();

    // Fetch project details
    const { data: projectData, error } = await supabase
      .from("projects")
      .select("id, reference_code, tracking_token, client_email, client_name, topic")
      .eq("id", projectId)
      .single();

    if (error || !projectData) {
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
    };

    // Send completion email
    await notifyProjectCompletion({
      clientEmail: project.client_email,
      clientName: project.client_name,
      referenceCode: project.reference_code,
      trackingToken: project.tracking_token,
      topic: project.topic,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Completion notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
