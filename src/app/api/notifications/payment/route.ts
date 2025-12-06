import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import {
  notifyPaymentValidated,
  notifyPaymentRejected,
} from "@/lib/email/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, action, rejectionReason, amountValidated } = body;

    if (!projectId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRouteClient();

    // Fetch project details for email
    const { data: projectData, error } = await supabase
      .from("projects")
      .select("client_email, client_name, reference_code, tracking_token")
      .eq("id", projectId)
      .single();

    if (error || !projectData) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectData as {
      client_email: string;
      client_name: string;
      reference_code: string;
      tracking_token: string;
    };

    if (action === "validated") {
      await notifyPaymentValidated({
        clientEmail: project.client_email,
        clientName: project.client_name,
        referenceCode: project.reference_code,
        trackingToken: project.tracking_token,
        amountValidated: amountValidated || 0,
      });
    } else if (action === "rejected") {
      await notifyPaymentRejected({
        clientEmail: project.client_email,
        clientName: project.client_name,
        referenceCode: project.reference_code,
        trackingToken: project.tracking_token,
        rejectionReason: rejectionReason || "Payment could not be verified",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
