import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";

// Type for usage data (table may not exist yet in database types)
interface UsageRow {
  writer_id: string;
  date: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  session_count: number;
  message_count: number;
  profiles: { id: string; full_name: string; email: string } | null;
}

interface BlockedAttempt {
  writer_id: string | null;
  id: string;
}

// GET /api/agent/admin/usage - Get all writers' usage (admin only)
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profileData = profile as { role: string } | null;

  if (profileData?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate =
    searchParams.get("startDate") || getDefaultStartDate();
  const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0];
  const writerId = searchParams.get("writerId");

  // Build query for daily usage
  let query = supabase
    .from("writer_usage_daily")
    .select(
      `
      *,
      profiles:writer_id (
        id,
        full_name,
        email
      )
    `
    )
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (writerId) {
    query = query.eq("writer_id", writerId);
  }

  const { data: usageData, error } = await query;

  if (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }

  // Get blocked attempts count per writer
  const { data: blockedCounts } = await supabase
    .from("agent_blocked_attempts")
    .select("writer_id, id")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`);

  // Aggregate by writer
  const writerStats = new Map<
    string,
    {
      writer: { id: string; full_name: string; email: string } | null;
      totalTokens: number;
      totalSessions: number;
      totalMessages: number;
      blockedAttempts: number;
      daysActive: number;
    }
  >();

  const typedUsageData = (usageData || []) as UsageRow[];

  for (const typedUsage of typedUsageData) {
    const id = typedUsage.writer_id;
    const existing = writerStats.get(id) || {
      writer: typedUsage.profiles,
      totalTokens: 0,
      totalSessions: 0,
      totalMessages: 0,
      blockedAttempts: 0,
      daysActive: 0,
    };

    writerStats.set(id, {
      writer: existing.writer || typedUsage.profiles,
      totalTokens: existing.totalTokens + (typedUsage.total_tokens || 0),
      totalSessions: existing.totalSessions + (typedUsage.session_count || 0),
      totalMessages: existing.totalMessages + (typedUsage.message_count || 0),
      blockedAttempts: existing.blockedAttempts,
      daysActive: existing.daysActive + 1,
    });
  }

  // Add blocked attempts count
  const typedBlockedCounts = (blockedCounts || []) as BlockedAttempt[];
  for (const blocked of typedBlockedCounts) {
    if (blocked.writer_id) {
      const existing = writerStats.get(blocked.writer_id);
      if (existing) {
        existing.blockedAttempts++;
      }
    }
  }

  // Calculate totals
  const totals = {
    totalTokens: 0,
    totalSessions: 0,
    totalMessages: 0,
    totalBlockedAttempts: 0,
    activeWriters: writerStats.size,
  };

  Array.from(writerStats.values()).forEach((stats) => {
    totals.totalTokens += stats.totalTokens;
    totals.totalSessions += stats.totalSessions;
    totals.totalMessages += stats.totalMessages;
    totals.totalBlockedAttempts += stats.blockedAttempts;
  });

  return NextResponse.json({
    period: { startDate, endDate },
    totals,
    writerStats: Array.from(writerStats.entries()).map(([writerId, stats]) => ({
      writerId,
      ...stats,
    })),
    dailyUsage: usageData,
  });
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
}
