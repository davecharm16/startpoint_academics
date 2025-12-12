"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateUniqueReferralCode, normalizeReferralCode } from "@/lib/utils/referral-code";
import { z } from "zod";
import { Resend } from "resend";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export interface RegisterResult {
  success: boolean;
  userId?: string;
  referralCode?: string;
  hasReferralDiscount?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerClient(data: RegisterInput): Promise<RegisterResult> {
  // Validate input
  const validation = registerSchema.safeParse(data);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    const issues = validation.error.issues || [];
    issues.forEach((issue) => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
    });
    return { success: false, fieldErrors, error: "Validation failed" };
  }

  const { email, password, fullName, phone, referralCode } = validation.data;
  const supabase = createAdminClient();

  try {
    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingProfile) {
      return {
        success: false,
        error: "An account with this email already exists",
        fieldErrors: { email: "Email already registered" },
      };
    }

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (referralCode) {
      const normalizedCode = normalizeReferralCode(referralCode);
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, referral_code")
        .ilike("referral_code", normalizedCode)
        .single();

      const referrerData = referrer as { id: string; referral_code: string } | null;
      if (!referrerData) {
        return {
          success: false,
          error: "Invalid referral code",
          fieldErrors: { referralCode: "This referral code is not valid" },
        };
      }
      referrerId = referrerData.id;
    }

    // Get existing referral codes for collision checking
    const { data: existingCodes } = await supabase
      .from("profiles")
      .select("referral_code")
      .not("referral_code", "is", null);

    const codesData = existingCodes as { referral_code: string }[] | null;
    const codeList = codesData?.map((p) => p.referral_code) || [];
    const newReferralCode = generateUniqueReferralCode(fullName, codeList);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm for now
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
      },
    });

    if (authError || !authData.user) {
      console.error("Auth error:", authError);
      return {
        success: false,
        error: authError?.message || "Failed to create account",
      };
    }

    // Create profile with client role
    // Using type assertion because client role was added in migration 00008
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: email.toLowerCase(),
      full_name: fullName,
      phone: phone || null,
      role: "client" as "admin" | "writer", // Type assertion for compatibility
      referral_code: newReferralCode,
      referred_by: referrerId,
      is_active: true,
    } as never);

    if (profileError) {
      console.error("Profile error:", profileError);
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: "Failed to create profile. Please try again.",
      };
    }

    // Create referral record if referred
    if (referrerId) {
      // Type assertion for new referrals table from migration 00008
      await supabase.from("referrals" as "profiles").insert({
        referrer_id: referrerId,
        referred_id: authData.user.id,
        referred_email: email.toLowerCase(),
        status: "signed_up",
      } as never);
    }

    // Link existing projects by email
    // Note: This function is defined in migration 00008
    await supabase.rpc("link_projects_to_client" as "is_admin", {
      client_id: authData.user.id,
      client_email_param: email.toLowerCase(),
    } as never);

    // Send welcome email
    await sendWelcomeEmail(email, fullName, newReferralCode);

    return {
      success: true,
      userId: authData.user.id,
      referralCode: newReferralCode,
      hasReferralDiscount: !!referrerId,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

async function sendWelcomeEmail(
  email: string,
  fullName: string,
  referralCode: string
): Promise<void> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping welcome email");
      return;
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@startpointacademics.com";

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to Startpoint Academics!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a365d;">Welcome to Startpoint Academics!</h1>
          <p>Hi ${fullName},</p>
          <p>Thank you for creating an account with us. We're excited to have you!</p>

          <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Referral Code</h3>
            <p style="font-size: 24px; font-weight: bold; color: #2b6cb0; letter-spacing: 2px;">
              ${referralCode}
            </p>
            <p style="font-size: 14px; color: #718096;">
              Share this code with friends! When they sign up and make their first order,
              you'll both earn rewards.
            </p>
          </div>

          <h3>Getting Started</h3>
          <ul>
            <li>Browse our services and packages</li>
            <li>Submit your first project</li>
            <li>Track your projects in real-time</li>
            <li>Earn rewards by referring friends</li>
          </ul>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Best regards,<br/>The Startpoint Academics Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    // Don't fail registration if email fails
  }
}
