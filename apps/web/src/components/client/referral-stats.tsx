"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@startpoint/ui";
import { Users, UserCheck, TrendingUp, Coins } from "lucide-react";

export interface ReferralStatsProps {
  referrals: Array<{
    id: string;
    status: "signed_up" | "converted";
    reward_amount: number | null;
    reward_status: string | null;
  }>;
  transactions: Array<{
    type: string;
    amount: number;
  }>;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

export function ReferralStats({ referrals, transactions }: ReferralStatsProps) {
  const totalReferrals = referrals.length;
  const conversions = referrals.filter((r) => r.status === "converted").length;
  const conversionRate =
    totalReferrals > 0 ? Math.round((conversions / totalReferrals) * 100) : 0;
  const totalEarned = transactions
    .filter((t) => t.type === "referral_reward" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: "Total Referrals",
      value: totalReferrals.toString(),
      description: "Friends referred",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Conversions",
      value: conversions.toString(),
      description: "Completed orders",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: "Of referrals converted",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Earned",
      value: formatCurrency(totalEarned),
      description: "From referral rewards",
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
