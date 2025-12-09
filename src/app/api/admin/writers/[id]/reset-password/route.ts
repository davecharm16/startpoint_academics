import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { passwordResetEmail } from "@/lib/email/templates";
import { randomBytes } from "crypto";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: writerId } = await context.params;

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

    // Get the writer's info
    const adminClient = createAdminClient();
    const { data: writerData } = await adminClient
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", writerId)
      .single();

    const writer = writerData as { id: string; email: string; full_name: string; role: string } | null;

    if (!writer) {
      return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    }

    if (writer.role !== "writer") {
      return NextResponse.json({ error: "Can only reset password for writers" }, { status: 400 });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Update password via Supabase Auth admin API
    const { error: authError } = await adminClient.auth.admin.updateUserById(
      writerId,
      { password: tempPassword }
    );

    if (authError) {
      console.error("Password reset error:", authError);
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    // Set must_change_password flag
    const { error: profileError } = await (
      adminClient.from("profiles") as ReturnType<typeof adminClient.from>
    ).update({
      must_change_password: true,
    } as never).eq("id", writerId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't fail - password was still reset
    }

    // Send email with new password
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`;
    const emailContent = passwordResetEmail({
      writerName: writer.full_name,
      email: writer.email,
      tempPassword,
      loginUrl,
    });

    const emailResult = await sendEmail({
      to: writer.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!emailResult.success) {
      console.warn("Password reset email failed:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      tempPassword, // Show to admin in case email fails
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
