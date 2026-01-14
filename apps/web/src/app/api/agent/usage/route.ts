import { NextResponse } from "next/server";
import { createClient } from "@startpoint/supabase/server";
import {
  getDailyResetTime,
  getWeeklyResetTime,
  DEFAULT_LIMITS,
} from "@startpoint/ai";

// Helper to cast supabase client for new agent tables (types will be correct after migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const agentDb = (supabase: any) => supabase;

// Type for usage data
interface UsageDay {
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
  session_count?: number;
  message_count?: number;
}

// GET /api/agent/usage - Get current writer's usage stats
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStart();

  // Get daily usage
  const { data: dailyUsage } = await agentDb(supabase)
    .from("writer_usage_daily")
    .select("*")
    .eq("writer_id", user.id)
    .eq("date", today)
    .single();

  // Get weekly usage
  const { data: weeklyUsage } = await agentDb(supabase)
    .from("writer_usage_daily")
    .select("*")
    .eq("writer_id", user.id)
    .gte("date", weekStart)
    .lte("date", today);

  // Calculate totals
  interface UsageTotals {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    session_count: number;
    message_count: number;
  }
  const weeklyTotals = ((weeklyUsage || []) as UsageDay[]).reduce<UsageTotals>(
    (acc, day) => ({
      total_tokens: acc.total_tokens + (day.total_tokens || 0),
      input_tokens: acc.input_tokens + (day.input_tokens || 0),
      output_tokens: acc.output_tokens + (day.output_tokens || 0),
      session_count: acc.session_count + (day.session_count || 0),
      message_count: acc.message_count + (day.message_count || 0),
    }),
    {
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
      session_count: 0,
      message_count: 0,
    }
  );

  // Get usage limits (could be customized per writer in the future)
  const limits = DEFAULT_LIMITS;

  // Calculate remaining
  const dailyRemaining = Math.max(
    0,
    limits.dailyTokenLimit - (dailyUsage?.total_tokens || 0)
  );
  const weeklyRemaining = Math.max(
    0,
    limits.weeklyTokenLimit - weeklyTotals.total_tokens
  );

  return NextResponse.json({
    daily: {
      used: dailyUsage?.total_tokens || 0,
      limit: limits.dailyTokenLimit,
      remaining: dailyRemaining,
      percentage: Math.round(
        ((dailyUsage?.total_tokens || 0) / limits.dailyTokenLimit) * 100
      ),
      sessions: dailyUsage?.session_count || 0,
      messages: dailyUsage?.message_count || 0,
      resetsAt: getDailyResetTime(),
    },
    weekly: {
      used: weeklyTotals.total_tokens,
      limit: limits.weeklyTokenLimit,
      remaining: weeklyRemaining,
      percentage: Math.round(
        (weeklyTotals.total_tokens / limits.weeklyTokenLimit) * 100
      ),
      sessions: weeklyTotals.session_count,
      messages: weeklyTotals.message_count,
      resetsAt: getWeeklyResetTime(),
    },
    session: {
      limit: limits.sessionTokenLimit,
    },
    limits,
  });
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  return monday.toISOString().split("T")[0];
}
