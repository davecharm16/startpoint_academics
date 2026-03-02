"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
} from "@startpoint/ui";
import { createClient } from "@startpoint/supabase/client";

export interface PayoutRequestFormProps {
  maxAmount: number;
  minimumPayout: number;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

export function PayoutRequestForm({
  maxAmount,
  minimumPayout,
  userId,
  onSuccess,
  onCancel,
}: PayoutRequestFormProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState<number>(maxAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isFormValid =
    paymentMethod !== "" &&
    accountNumber.trim() !== "" &&
    accountName.trim() !== "" &&
    amount >= minimumPayout &&
    amount <= maxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Create payout request
      const { error: insertError } = await (
        supabase.from(
          "payout_requests" as "profiles"
        ) as ReturnType<typeof supabase.from>
      ).insert({
        user_id: userId,
        amount: amount,
        payment_method: paymentMethod,
        payment_details: {
          account_number: accountNumber,
          account_name: accountName,
        },
        status: "pending",
      } as never);

      if (insertError) {
        setError("Failed to submit payout request. Please try again.");
        return;
      }

      // Deduct from available balance (put on hold)
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("reward_balance")
        .eq("id", userId)
        .single();

      const currentBalance = Number(
        (currentProfile as { reward_balance?: number })?.reward_balance || 0
      );
      const newBalance = Math.max(currentBalance - amount, 0);

      await (
        supabase.from("profiles") as ReturnType<typeof supabase.from>
      ).update({ reward_balance: newBalance } as never).eq("id", userId);

      // Create hold transaction
      await (
        supabase.from(
          "reward_transactions" as "profiles"
        ) as ReturnType<typeof supabase.from>
      ).insert({
        user_id: userId,
        type: "payout",
        amount: -amount,
        balance_after: newBalance,
        notes: `Payout request - ${paymentMethod} - awaiting admin approval`,
      } as never);

      setSuccess(true);
      onSuccess();
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertDescription>
              Your payout request has been submitted and is awaiting admin
              approval.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Cash Payout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              type="text"
              placeholder="Enter account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payout-amount">Amount</Label>
            <Input
              id="payout-amount"
              type="number"
              min={minimumPayout}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Min: {formatCurrency(minimumPayout)} — Max:{" "}
              {formatCurrency(maxAmount)}
            </p>
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Payout Request"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
