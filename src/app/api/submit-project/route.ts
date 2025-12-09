import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReferenceCode } from "@/lib/utils/reference-code";
import { notifySubmissionConfirmation } from "@/lib/email/notifications";
import type { Database } from "@/types/database";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type PaymentProofInsert = Database["public"]["Tables"]["payment_proofs"]["Insert"];
type ProjectHistoryInsert = Database["public"]["Tables"]["project_history"]["Insert"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const dataString = formData.get("data") as string;
    const screenshot = formData.get("screenshot") as File | null;

    if (!dataString) {
      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataString);

    // Validate required fields
    const requiredFields = [
      "topic",
      "deadline",
      "expected_outputs",
      "client_name",
      "client_email",
      "client_phone",
      "package_id",
      "agreed_price",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate deadline is in the future
    const deadline = new Date(data.deadline);
    if (deadline <= new Date()) {
      return NextResponse.json(
        { error: "Deadline must be in the future" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.client_email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate Philippine mobile number
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(data.client_phone)) {
      return NextResponse.json(
        { error: "Invalid Philippine mobile number" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Generate unique reference code and tracking token
    const referenceCode = await generateReferenceCode();
    const trackingToken = crypto.randomUUID();

    // Upload screenshot if provided
    let screenshotPath: string | null = null;
    if (screenshot) {
      const fileExt = screenshot.name.split(".").pop();
      const fileName = `${referenceCode.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, screenshot, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
        // Continue without screenshot - don't fail the submission
      } else {
        screenshotPath = fileName;
      }
    }

    // Build requirements string from form data
    const requirementsData = {
      expected_outputs: data.expected_outputs,
      ...(data.requirements || {}),
    };

    // Prepare project insert data
    const projectData: ProjectInsert = {
      reference_code: referenceCode,
      tracking_token: trackingToken,
      package_id: data.package_id,
      agreed_price: Number(data.agreed_price),
      status: "submitted",
      topic: data.topic,
      deadline: data.deadline,
      requirements: JSON.stringify(requirementsData),
      special_instructions: data.special_instructions || null,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone || null,
    };

    // Create project record - use type assertion to bypass generic inference issue
    const { data: project, error: projectError } = await (supabase
      .from("projects") as ReturnType<typeof supabase.from>)
      .insert(projectData as never)
      .select()
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    const projectResult = project as { id: string };

    // Create payment proof record if screenshot was uploaded
    if (screenshotPath) {
      const paymentProofData: PaymentProofInsert = {
        project_id: projectResult.id,
        storage_path: screenshotPath,
        type: "downpayment",
        amount_claimed: Number(data.amount_paid) || 0,
      };

      const { error: paymentError } = await (supabase
        .from("payment_proofs") as ReturnType<typeof supabase.from>)
        .insert(paymentProofData as never);

      if (paymentError) {
        console.error("Payment proof creation error:", paymentError);
        // Continue - project is created, payment proof is secondary
      }
    }

    // Create initial project history entry
    const historyData: ProjectHistoryInsert = {
      project_id: projectResult.id,
      action: "submitted",
      new_status: "submitted",
      notes: "Project submitted by client",
    };

    await (supabase
      .from("project_history") as ReturnType<typeof supabase.from>)
      .insert(historyData as never);

    // Fetch package name for email
    const { data: packageResult } = await supabase
      .from("packages")
      .select("name")
      .eq("id", data.package_id)
      .single();

    const packageData = packageResult as { name: string } | null;

    // Send submission confirmation email (non-blocking)
    notifySubmissionConfirmation({
      clientEmail: data.client_email,
      clientName: data.client_name,
      referenceCode,
      trackingToken,
      topic: data.topic,
      packageName: packageData?.name || "Academic Service",
      deadline: new Date(data.deadline),
      agreedPrice: Number(data.agreed_price),
    }).catch((err) => {
      console.error("Failed to send submission confirmation email:", err);
    });

    return NextResponse.json({
      success: true,
      reference_code: referenceCode,
      tracking_token: trackingToken,
      project_id: projectResult.id,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
