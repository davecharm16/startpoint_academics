"use client";

import { useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  format,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Project {
  id: string;
  agreed_price: number;
  discount_amount: number;
  additional_charges: number;
  writer_share: number;
  admin_share: number;
  created_at: string;
}

interface ProfitSummaryProps {
  projects: Project[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ProfitSummary({ projects }: ProfitSummaryProps) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const now = new Date();

  // Current period
  const currentStart = period === "week" ? startOfWeek(now) : startOfMonth(now);
  const currentEnd = period === "week" ? endOfWeek(now) : endOfMonth(now);

  // Previous period
  const previousStart =
    period === "week"
      ? startOfWeek(subWeeks(now, 1))
      : startOfMonth(subMonths(now, 1));
  const previousEnd =
    period === "week"
      ? endOfWeek(subWeeks(now, 1))
      : endOfMonth(subMonths(now, 1));

  // Filter projects by period
  const currentProjects = projects.filter((p) => {
    const date = new Date(p.created_at);
    return date >= currentStart && date <= currentEnd;
  });

  const previousProjects = projects.filter((p) => {
    const date = new Date(p.created_at);
    return date >= previousStart && date <= previousEnd;
  });

  // Calculate metrics
  const calculateMetrics = (projectList: Project[]) => {
    const revenue = projectList.reduce(
      (sum, p) => sum + p.agreed_price - p.discount_amount + p.additional_charges,
      0
    );
    const writerPayments = projectList.reduce((sum, p) => sum + p.writer_share, 0);
    const profit = projectList.reduce((sum, p) => sum + p.admin_share, 0);
    return { revenue, writerPayments, profit, count: projectList.length };
  };

  const current = calculateMetrics(currentProjects);
  const previous = calculateMetrics(previousProjects);

  // Calculate change percentages
  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = getChange(current.revenue, previous.revenue);
  const profitChange = getChange(current.profit, previous.profit);

  const ChangeIndicator = ({ change }: { change: number }) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />+{change.toFixed(0)}%
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          {change.toFixed(0)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="h-4 w-4 mr-1" />
        0%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profit Summary</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={period === "week" ? "default" : "outline"}
              onClick={() => setPeriod("week")}
            >
              This Week
            </Button>
            <Button
              size="sm"
              variant={period === "month" ? "default" : "outline"}
              onClick={() => setPeriod("month")}
            >
              This Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Revenue */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(current.revenue)}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                vs last {period}
              </span>
              <ChangeIndicator change={revenueChange} />
            </div>
          </div>

          {/* Writer Payments */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Writer Payments</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(current.writerPayments)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {current.count} project{current.count !== 1 ? "s" : ""} completed
            </p>
          </div>

          {/* Profit */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Net Profit</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {formatCurrency(current.profit)}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-green-600">
                vs last {period}
              </span>
              <ChangeIndicator change={profitChange} />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          {period === "week"
            ? `${format(currentStart, "MMM d")} - ${format(currentEnd, "MMM d, yyyy")}`
            : format(currentStart, "MMMM yyyy")}
        </p>
      </CardContent>
    </Card>
  );
}
