import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/resend";
import { adminDailyDigestEmail } from "@/lib/email/templates";
import { differenceInHours, startOfDay, endOfDay } from "date-fns";

// Create a service role client for cron jobs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Cron job to send daily digest to admin
// Should be called once daily (e.g., 8 AM)
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Get admin details
    const adminEmail = process.env.ADMIN_EMAIL || "admin@startpointacademics.com";
    const adminName = process.env.ADMIN_NAME || "Admin";

    // Fetch today's new submissions
    const { data: newSubmissions } = await supabaseAdmin
      .from("projects")
      .select("reference_code, topic, client_name, status")
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch pending payment validations
    const { data: pendingPayments } = await supabaseAdmin
      .from("projects")
      .select("reference_code, topic, client_name, status")
      .eq("status", "submitted")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch projects with upcoming deadlines (48h)
    const { data: upcomingDeadlines } = await supabaseAdmin
      .from("projects")
      .select(`
        reference_code,
        topic,
        deadline,
        profiles!projects_writer_id_fkey (full_name)
      `)
      .in("status", ["assigned", "in_progress", "review"])
      .lte("deadline", in48Hours.toISOString())
      .gte("deadline", now.toISOString())
      .order("deadline", { ascending: true })
      .limit(10);

    // Get stats
    const { count: newSubmissionsCount } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString());

    const { count: pendingValidationCount } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted");

    const { count: inProgressCount } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ["assigned", "in_progress", "review"]);

    const { count: completedTodayCount } = await supabaseAdmin
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "complete")
      .gte("completed_at", todayStart.toISOString())
      .lte("completed_at", todayEnd.toISOString());

    // Calculate today's revenue (admin share from completed projects)
    const { data: completedToday } = await supabaseAdmin
      .from("projects")
      .select("admin_share")
      .eq("status", "complete")
      .gte("completed_at", todayStart.toISOString())
      .lte("completed_at", todayEnd.toISOString());

    const totalRevenue = (completedToday || []).reduce(
      (sum, p) => sum + (p.admin_share || 0),
      0
    );

    // Format upcoming deadlines
    const formattedDeadlines = (upcomingDeadlines || []).map((p) => {
      const profiles = p.profiles as unknown as { full_name: string } | null;
      return {
        referenceCode: p.reference_code,
        topic: p.topic,
        writerName: profiles?.full_name || "Unassigned",
        deadline: new Date(p.deadline),
        hoursRemaining: differenceInHours(new Date(p.deadline), now),
      };
    });

    // Generate email
    const { subject, html } = adminDailyDigestEmail({
      adminName,
      date: now,
      stats: {
        newSubmissions: newSubmissionsCount || 0,
        pendingValidation: pendingValidationCount || 0,
        inProgress: inProgressCount || 0,
        completedToday: completedTodayCount || 0,
        totalRevenue,
      },
      upcomingDeadlines: formattedDeadlines,
      recentSubmissions: (newSubmissions || []).map((p) => ({
        referenceCode: p.reference_code,
        topic: p.topic,
        clientName: p.client_name,
        status: p.status,
      })),
      pendingPayments: (pendingPayments || []).map((p) => ({
        referenceCode: p.reference_code,
        topic: p.topic,
        clientName: p.client_name,
        status: p.status,
      })),
      dashboardUrl: `${BASE_URL}/admin`,
    });

    // Send email
    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });

    return NextResponse.json({
      success: true,
      message: "Daily digest sent",
      stats: {
        newSubmissions: newSubmissionsCount,
        pendingValidation: pendingValidationCount,
        inProgress: inProgressCount,
        completedToday: completedTodayCount,
      },
    });
  } catch (error) {
    console.error("Daily digest cron error:", error);
    return NextResponse.json(
      { error: "Failed to send daily digest" },
      { status: 500 }
    );
  }
}
