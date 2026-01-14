/**
 * Usage limits configuration
 */
export interface UsageLimits {
  dailyTokenLimit: number;
  weeklyTokenLimit: number;
  sessionTokenLimit: number;
}

/**
 * Default limits (can be overridden by admin)
 */
export const DEFAULT_LIMITS: UsageLimits = {
  dailyTokenLimit: 100000,
  weeklyTokenLimit: 500000,
  sessionTokenLimit: 50000,
};

/**
 * Current usage stats for a writer
 */
export interface UsageStats {
  dailyTokens: number;
  weeklyTokens: number;
  sessionTokens: number;
  dailyResetAt: Date;
  weeklyResetAt: Date;
}

/**
 * Result of a usage check
 */
export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  remaining: {
    daily: number;
    weekly: number;
    session: number;
  };
  resetTimes: {
    daily: Date;
    weekly: Date;
  };
}

/**
 * Check if usage is within limits
 */
export function checkUsageLimits(
  stats: UsageStats,
  limits: UsageLimits,
  estimatedTokens: number = 0
): UsageCheckResult {
  const now = new Date();

  // Calculate remaining tokens
  const dailyRemaining = limits.dailyTokenLimit - stats.dailyTokens;
  const weeklyRemaining = limits.weeklyTokenLimit - stats.weeklyTokens;
  const sessionRemaining = limits.sessionTokenLimit - stats.sessionTokens;

  // Calculate reset times
  const dailyResetAt = new Date(stats.dailyResetAt);
  const weeklyResetAt = new Date(stats.weeklyResetAt);

  // Check if limits would be exceeded
  if (dailyRemaining - estimatedTokens < 0) {
    return {
      allowed: false,
      reason: `Daily token limit reached. Resets at ${formatTime(dailyResetAt)}.`,
      remaining: {
        daily: Math.max(0, dailyRemaining),
        weekly: Math.max(0, weeklyRemaining),
        session: Math.max(0, sessionRemaining),
      },
      resetTimes: {
        daily: dailyResetAt,
        weekly: weeklyResetAt,
      },
    };
  }

  if (weeklyRemaining - estimatedTokens < 0) {
    return {
      allowed: false,
      reason: `Weekly token limit reached. Resets at ${formatTime(weeklyResetAt)}.`,
      remaining: {
        daily: Math.max(0, dailyRemaining),
        weekly: Math.max(0, weeklyRemaining),
        session: Math.max(0, sessionRemaining),
      },
      resetTimes: {
        daily: dailyResetAt,
        weekly: weeklyResetAt,
      },
    };
  }

  if (sessionRemaining - estimatedTokens < 0) {
    return {
      allowed: false,
      reason: `Session token limit reached. Please start a new session.`,
      remaining: {
        daily: Math.max(0, dailyRemaining),
        weekly: Math.max(0, weeklyRemaining),
        session: Math.max(0, sessionRemaining),
      },
      resetTimes: {
        daily: dailyResetAt,
        weekly: weeklyResetAt,
      },
    };
  }

  return {
    allowed: true,
    remaining: {
      daily: dailyRemaining - estimatedTokens,
      weekly: weeklyRemaining - estimatedTokens,
      session: sessionRemaining - estimatedTokens,
    },
    resetTimes: {
      daily: dailyResetAt,
      weekly: weeklyResetAt,
    },
  };
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Calculate daily reset time (midnight local time)
 */
export function getDailyResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Calculate weekly reset time (Monday midnight)
 */
export function getWeeklyResetTime(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * Estimate tokens for a message (rough approximation)
 * ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
