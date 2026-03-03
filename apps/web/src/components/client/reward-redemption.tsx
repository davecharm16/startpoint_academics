"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
} from "@startpoint/ui";
import { createClient } from "@startpoint/supabase/client";
import { PayoutRequestForm } from "./payout-request-form";

export interface RewardRedemptionProps {
  rewardBalance: number;
  minimumPayout: number;
  applyToNextOrder: boolean;
  hasPendingPayout: boolean;
  userId: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

export function RewardRedemption({
  rewardBalance,
  minimumPayout,
  applyToNextOrder,
  hasPendingPayout,
  userId,
}: RewardRedemptionProps) {
  const router = useRouter();
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleApplyToOrder = async () => {
    setIsToggling(true);
    try {
      const supabase = createClient();
      await (
        supabase.from("profiles") as ReturnType<typeof supabase.from>
      ).update({ apply_rewards_to_next_order: !applyToNextOrder } as never).eq(
        "id",
        userId
      );
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  };

  const handlePayoutSuccess = () => {
    setShowPayoutForm(false);
    router.refresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Reward Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(rewardBalance)}
          </div>

          {hasPendingPayout && (
            <Alert className="mt-4">
              <AlertDescription>
                You have a pending payout request. Your balance is on hold.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleApplyToOrder}
              disabled={rewardBalance <= 0 || hasPendingPayout || isToggling}
            >
              {applyToNextOrder
                ? "Applied to Next Order \u2713"
                : "Apply to Next Order"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPayoutForm(true)}
              disabled={rewardBalance < minimumPayout || hasPendingPayout}
            >
              Request Cash Payout
            </Button>
          </div>

          {rewardBalance < minimumPayout &&
            rewardBalance > 0 &&
            !hasPendingPayout && (
              <p className="text-xs text-muted-foreground mt-2">
                Minimum {formatCurrency(minimumPayout)} required for cash payout
              </p>
            )}
        </CardContent>
      </Card>

      {showPayoutForm && (
        <PayoutRequestForm
          maxAmount={rewardBalance}
          minimumPayout={minimumPayout}
          userId={userId}
          onSuccess={handlePayoutSuccess}
          onCancel={() => setShowPayoutForm(false)}
        />
      )}
    </>
  );
}
