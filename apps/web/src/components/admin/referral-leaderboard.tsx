"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  full_name: string;
  referral_code: string;
  total_referrals: number;
  conversions: number;
  total_earned: number;
  available_balance: number;
}

interface ReferralLeaderboardProps {
  data: LeaderboardEntry[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function ReferralLeaderboard({ data }: ReferralLeaderboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No referral data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">#</th>
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Referral Code</th>
            <th className="pb-3 font-medium text-right">Signups</th>
            <th className="pb-3 font-medium text-right">Conversions</th>
            <th className="pb-3 font-medium text-right">Total Earned</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => {
            const isExpanded = expandedId === entry.id;
            const conversionRate =
              entry.total_referrals > 0
                ? Math.round(
                    (entry.conversions / entry.total_referrals) * 100
                  )
                : 0;

            return (
              <tr
                key={entry.id}
                className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => toggle(entry.id)}
              >
                <td className="py-3 text-sm" colSpan={6}>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-6 items-center">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div>{entry.full_name}</div>
                      <div className="font-mono text-xs">
                        {entry.referral_code}
                      </div>
                      <div className="text-right">{entry.total_referrals}</div>
                      <div className="text-right">{entry.conversions}</div>
                      <div className="text-right font-medium">
                        {formatCurrency(entry.total_earned)}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 ml-6 p-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-foreground">
                              Conversion Rate:
                            </span>{" "}
                            {conversionRate}%
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              Available Balance:
                            </span>{" "}
                            {formatCurrency(entry.available_balance)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
