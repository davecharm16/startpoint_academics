"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface UsageData {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    sessions: number;
    messages: number;
    resetsAt: string;
  };
  weekly: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    sessions: number;
    messages: number;
    resetsAt: string;
  };
  session: {
    limit: number;
  };
}

export function UsageMeter() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await fetch("/api/agent/usage");
      if (!response.ok) throw new Error("Failed to load usage");
      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="p-4 text-sm text-destructive">
        {error || "Failed to load usage data"}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <UsageBar
        label="Daily Usage"
        used={usage.daily.used}
        limit={usage.daily.limit}
        percentage={usage.daily.percentage}
        resetsAt={usage.daily.resetsAt}
      />
      <UsageBar
        label="Weekly Usage"
        used={usage.weekly.used}
        limit={usage.weekly.limit}
        percentage={usage.weekly.percentage}
        resetsAt={usage.weekly.resetsAt}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Today: {usage.daily.sessions} sessions, {usage.daily.messages} messages</div>
        <div>This week: {usage.weekly.sessions} sessions, {usage.weekly.messages} messages</div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
  percentage,
  resetsAt,
}: {
  label: string;
  used: number;
  limit: number;
  percentage: number;
  resetsAt: string;
}) {
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span
          className={`text-xs ${
            isDanger
              ? "text-destructive"
              : isWarning
                ? "text-yellow-600 dark:text-yellow-500"
                : "text-muted-foreground"
          }`}
        >
          {formatTokens(used)} / {formatTokens(limit)}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isDanger
              ? "bg-destructive"
              : isWarning
                ? "bg-yellow-500"
                : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground">
        Resets {formatResetTime(new Date(resetsAt))}
      </div>
    </div>
  );
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

function formatResetTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (diff <= 0) return "now";
  if (hours < 1) return `in ${minutes}m`;
  if (hours < 24) return `in ${hours}h ${minutes}m`;
  return `on ${date.toLocaleDateString()}`;
}
