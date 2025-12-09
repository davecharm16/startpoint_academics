import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { writerWelcomeEmail } from "@/lib/email/templates";
import { z } from "zod";
import { randomBytes } from "crypto";

// Validation schema
const createWriterSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  max_concurrent_projects: z.number().min(1).max(10).optional(),
});

// Generate secure 12-character password
function generateTempPassword(): string {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const special = "!@#$%";
  const allChars = lowercase + uppercase + numbers + special;

  // Ensure at least one of each type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining with random characters
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    password += allChars[bytes[i] % allChars.length];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createWriterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, full_name, phone, max_concurrent_projects } = validation.data;

    // Generate secure temporary password
    const tempPassword = generateTempPassword();

    // Use admin client to create user
    const adminClient = createAdminClient();

    // Create user in auth
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      if (
        authError.message.includes("already been registered") ||
        authError.message.includes("already exists")
      ) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed");
    }

    // Create profile with writer role and onboarding fields
    const { error: profileError } = await (
      adminClient.from("profiles") as ReturnType<typeof adminClient.from>
    ).insert({
      id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      role: "writer",
      max_concurrent_projects: max_concurrent_projects || 3,
      is_active: true,
      must_change_password: true,
      created_by: user.id,
      invited_at: new Date().toISOString(),
    } as never);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Send welcome email with credentials
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;
    const emailContent = writerWelcomeEmail({
      writerName: full_name,
      email,
      tempPassword,
      loginUrl,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!emailResult.success) {
      console.warn("Welcome email failed to send:", emailResult.error);
      // Don't fail the request, just log - admin can share password manually
    }

    return NextResponse.json({
      success: true,
      message: "Writer created successfully",
      writer: {
        id: authData.user.id,
        email,
        full_name,
      },
      tempPassword, // Shown once to admin in case email fails
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Writer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create writer account" },
      { status: 500 }
    );
  }
}

// GET endpoint to list writers
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all writers with workload info
    const { data: writers, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        is_active,
        max_concurrent_projects,
        must_change_password,
        invited_at,
        created_at
      `)
      .eq("role", "writer")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get current project counts for each writer
    const { data: projectCountsData } = await supabase
      .from("projects")
      .select("writer_id")
      .in("status", ["assigned", "in_progress", "review"])
      .not("writer_id", "is", null);

    const projectCounts = projectCountsData as Array<{ writer_id: string | null }> || [];

    const writerProjectCounts = projectCounts.reduce(
      (acc, project) => {
        if (project.writer_id) {
          acc[project.writer_id] = (acc[project.writer_id] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    type WriterRow = {
      id: string;
      email: string;
      full_name: string;
      phone: string | null;
      is_active: boolean;
      max_concurrent_projects: number;
      must_change_password: boolean;
      invited_at: string | null;
      created_at: string;
    };

    const writersList = (writers as WriterRow[] | null) || [];

    const writersWithWorkload = writersList.map((writer) => ({
      ...writer,
      current_projects: writerProjectCounts[writer.id] || 0,
      available_slots:
        writer.max_concurrent_projects - (writerProjectCounts[writer.id] || 0),
    }));

    return NextResponse.json(writersWithWorkload);
  } catch (error) {
    console.error("List writers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch writers" },
      { status: 500 }
    );
  }
}
