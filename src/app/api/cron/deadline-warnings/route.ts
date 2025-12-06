import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  notifyDeadlineWarningWriter,
  notifyDeadlineWarningAdmin,
} from "@/lib/email/notifications";
import { differenceInHours } from "date-fns";

// Create a service role client for cron jobs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cron job to check for approaching deadlines
// Should be called every hour
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
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find projects with deadlines in the next 48 hours
    // that are still in progress or review status
    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select(`
        id,
        reference_code,
        topic,
        deadline,
        status,
        client_name,
        profiles!projects_writer_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .in("status", ["assigned", "in_progress", "review"])
      .lte("deadline", in48Hours.toISOString())
      .gte("deadline", now.toISOString());

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No projects with approaching deadlines",
        checked: 0,
        notified: 0,
      });
    }

    // Get admin email from settings or environment
    const adminEmail = process.env.ADMIN_EMAIL || "admin@startpointacademics.com";

    let notifiedCount = 0;

    // Send notifications for each project
    for (const project of projects) {
      const deadline = new Date(project.deadline);
      const hoursRemaining = differenceInHours(deadline, now);

      // Skip if already notified recently (check project history)
      const { data: recentNotification } = await supabaseAdmin
        .from("project_history")
        .select("id")
        .eq("project_id", project.id)
        .eq("action", "deadline_warning")
        .gte("created_at", new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString())
        .single();

      if (recentNotification) {
        // Already notified in the last 12 hours
        continue;
      }

      const writer = project.profiles as unknown as { id: string; full_name: string; email: string } | null;

      // Notify writer if assigned
      if (writer && writer.email) {
        await notifyDeadlineWarningWriter({
          writerEmail: writer.email,
          writerName: writer.full_name,
          referenceCode: project.reference_code,
          topic: project.topic,
          deadline: deadline,
          currentStatus: project.status,
          projectId: project.id,
        });
      }

      // Notify admin for urgent deadlines (24 hours or less)
      if (hoursRemaining <= 24) {
        await notifyDeadlineWarningAdmin({
          adminEmail,
          referenceCode: project.reference_code,
          topic: project.topic,
          clientName: project.client_name,
          writerName: writer?.full_name || "Unassigned",
          deadline: deadline,
          currentStatus: project.status,
          hoursRemaining,
          projectId: project.id,
        });
      }

      // Log the notification
      await supabaseAdmin
        .from("project_history")
        .insert({
          project_id: project.id,
          action: "deadline_warning",
          notes: `Deadline warning sent (${hoursRemaining}h remaining)`,
        });

      notifiedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Deadline warnings sent`,
      checked: projects.length,
      notified: notifiedCount,
    });
  } catch (error) {
    console.error("Deadline warning cron error:", error);
    return NextResponse.json(
      { error: "Failed to process deadline warnings" },
      { status: 500 }
    );
  }
}
