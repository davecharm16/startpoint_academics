"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@startpoint/supabase/client";
import { Button, Badge } from "@startpoint/ui";
import { Check, X, Loader2 } from "lucide-react";

interface PayoutEntry {
  id: string;
  user_id: string;
  amount: number;
  payment_method: "gcash" | "bank";
  payment_details: { account_number?: string; account_name?: string };
  status: "pending" | "paid" | "rejected";
  rejection_reason: string | null;
  processed_at: string | null;
  created_at: string;
  clientName: string;
  clientEmail: string;
}

interface PayoutListProps {
  payouts: PayoutEntry[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

type StatusFilter = "all" | "pending" | "paid" | "rejected";

export function PayoutList({ payouts }: PayoutListProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = payouts.filter((p) => p.status === "pending").length;

  const filteredPayouts =
    activeFilter === "all"
      ? payouts
      : payouts.filter((p) => p.status === activeFilter);

  const handleApprove = async (payoutId: string) => {
    setProcessing(payoutId);
    const supabase = createClient();

    // Get current user (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Update payout status
    await (
      supabase.from(
        "payout_requests" as "profiles"
      ) as ReturnType<typeof supabase.from>
    )
      .update({
        status: "paid",
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      } as never)
      .eq("id", payoutId);

    setProcessing(null);
    router.refresh();
  };

  const handleReject = async (payoutId: string, reason: string) => {
    setProcessing(payoutId);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Find the payout to get user_id and amount
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    // Update payout status
    await (
      supabase.from(
        "payout_requests" as "profiles"
      ) as ReturnType<typeof supabase.from>
    )
      .update({
        status: "rejected",
        rejection_reason: reason,
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      } as never)
      .eq("id", payoutId);

    // Restore funds to client's balance
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("reward_balance")
      .eq("id", payout.user_id)
      .single();

    const currentBalance = Number(
      (clientProfile as any)?.reward_balance || 0
    );
    const restoredBalance = currentBalance + payout.amount;

    await (
      supabase.from("profiles") as ReturnType<typeof supabase.from>
    )
      .update({ reward_balance: restoredBalance } as never)
      .eq("id", payout.user_id);

    // Create adjustment transaction (restore)
    await (
      supabase.from(
        "reward_transactions" as "profiles"
      ) as ReturnType<typeof supabase.from>
    ).insert({
      user_id: payout.user_id,
      type: "adjustment",
      amount: payout.amount,
      balance_after: restoredBalance,
      reference_id: payoutId,
      reference_type: "payout_rejection",
      notes: `Payout request rejected: ${reason}`,
    } as never);

    setProcessing(null);
    setRejectingId(null);
    router.refresh();
  };

  const statusBadge = (status: PayoutEntry["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    }
  };

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(tab.value)}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Table */}
      {filteredPayouts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout) => (
                <React.Fragment key={payout.id}>
                  <tr className="border-b last:border-0">
                    <td className="py-3 text-sm">
                      <div>
                        <div className="font-medium">{payout.clientName}</div>
                        <div className="text-xs text-muted-foreground">
                          {payout.clientEmail}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-medium">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="py-3 text-sm">
                      {payout.payment_method === "gcash"
                        ? "GCash"
                        : "Bank Transfer"}
                    </td>
                    <td className="py-3 text-sm">
                      <div>
                        <div>{payout.payment_details?.account_name || "-"}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {payout.payment_details?.account_number || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(payout.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-sm">{statusBadge(payout.status)}</td>
                    <td className="py-3 text-sm">
                      {payout.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-200 hover:bg-green-50"
                            disabled={processing === payout.id}
                            onClick={() => handleApprove(payout.id)}
                          >
                            {processing === payout.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Mark as Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-200 hover:bg-red-50"
                            disabled={processing === payout.id}
                            onClick={() => {
                              setRejectingId(payout.id);
                              setRejectReason("");
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {rejectingId === payout.id && (
                    <tr key={`${payout.id}-reject`}>
                      <td colSpan={7} className="p-4 bg-muted/30">
                        <textarea
                          className="w-full border rounded p-2 text-sm"
                          placeholder="Enter rejection reason..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={!rejectReason.trim() || processing === payout.id}
                            onClick={() =>
                              handleReject(payout.id, rejectReason)
                            }
                          >
                            {processing === payout.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            Confirm Rejection
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No payouts match the selected filter.</p>
        </div>
      )}
    </div>
  );
}
