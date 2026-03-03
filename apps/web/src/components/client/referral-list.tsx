"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@startpoint/ui";
import { Share2 } from "lucide-react";

export interface ReferralListProps {
  referrals: Array<{
    id: string;
    referred_email: string;
    status: "signed_up" | "converted";
    reward_amount: number | null;
    reward_status: string | null;
    created_at: string;
  }>;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: "signed_up" | "converted") {
  if (status === "converted") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        Converted
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
      Signed Up
    </Badge>
  );
}

function getRewardStatusBadge(rewardStatus: string | null) {
  if (!rewardStatus) return null;

  switch (rewardStatus) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
          Pending
        </Badge>
      );
    case "available":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
          Available
        </Badge>
      );
    case "redeemed":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
          Redeemed
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
          Paid
        </Badge>
      );
    default:
      return null;
  }
}

export function ReferralList({ referrals }: ReferralListProps) {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-muted">
              <Share2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No referrals yet</p>
              <p className="text-sm text-muted-foreground">
                Share your code to get started!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referrals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-4"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {maskEmail(referral.referred_email)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Referred {formatDate(referral.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(referral.status)}
                {referral.reward_amount != null && referral.reward_amount > 0 && (
                  <span className="text-sm font-medium">
                    {formatCurrency(referral.reward_amount)}
                  </span>
                )}
                {getRewardStatusBadge(referral.reward_status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
