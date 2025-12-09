import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, pin, token } = body;

    if (!projectId || !pin || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { error: "Invalid PIN format" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch project to verify
    const { data: projectData } = await supabase
      .from("projects")
      .select("id, client_phone, tracking_token")
      .eq("id", projectId)
      .eq("tracking_token", token)
      .single();

    const project = projectData as {
      id: string;
      client_phone: string | null;
      tracking_token: string;
    } | null;

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if phone number matches
    const clientPhone = project.client_phone || "";
    const last4Digits = clientPhone.replace(/\D/g, "").slice(-4);

    if (last4Digits !== pin) {
      return NextResponse.json(
        { error: "Incorrect PIN. Please try again." },
        { status: 401 }
      );
    }

    // Set verification cookie (1 hour expiry)
    const cookieStore = await cookies();
    cookieStore.set(`track_verified_${projectId}`, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
