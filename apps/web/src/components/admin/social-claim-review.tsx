"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@startpoint/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
} from "@startpoint/ui";
import { Check, X, Loader2, ExternalLink } from "lucide-react";

export interface SocialClaimEntry {
  id: string;
  user_id: string;
  action_type: "like_page" | "follow_page" | "share_post";
  social_username: string | null;
  screenshot_path: string | null;
  discount_amount: number;
  status: "pending" | "verified" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  clientName: string;
  clientEmail: string;
  socialUrl: string;
}

interface SocialClaimReviewProps {
  claim: SocialClaimEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  like_page: "Like Page",
  follow_page: "Follow Page",
  share_post: "Share Post",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);

export function SocialClaimReview({
  claim,
  open,
  onOpenChange,
}: SocialClaimReviewProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && claim.screenshot_path) {
      const supabase = createClient();
      supabase.storage
        .from("social-proofs")
        .createSignedUrl(claim.screenshot_path, 3600)
        .then(({ data }) => {
          if (data?.signedUrl) {
            setScreenshotUrl(data.signedUrl);
          }
        });
    }
  }, [open, claim.screenshot_path]);

  const handleVerify = async () => {
    // Idempotent: only process pending claims
    if (claim.status !== "pending") return;

    setProcessing(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Check claim is still pending (double-verify prevention)
      const { data: currentClaim } = await (
        supabase.from(
          "social_claims" as "profiles"
        ) as ReturnType<typeof supabase.from>
      )
        .select("status")
        .eq("id", claim.id)
        .single();

      if ((currentClaim as { status: string } | null)?.status !== "pending") {
        setProcessing(false);
        onOpenChange(false);
        router.refresh();
        return;
      }

      // 2. Update social_claims: status='verified', verified_by, verified_at
      await (
        supabase.from(
          "social_claims" as "profiles"
        ) as ReturnType<typeof supabase.from>
      )
        .update({
          status: "verified",
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        } as never)
        .eq("id", claim.id);

      // 3. Get client's current reward_balance
      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("reward_balance")
        .eq("id", claim.user_id)
        .single();

      const currentBalance = Number(
        (clientProfile as { reward_balance?: number } | null)?.reward_balance || 0
      );

      // 4. Add discount_amount to balance
      const newBalance = currentBalance + claim.discount_amount;

      // 5. Update profiles.reward_balance
      await (
        supabase.from("profiles") as ReturnType<typeof supabase.from>
      )
        .update({ reward_balance: newBalance } as never)
        .eq("id", claim.user_id);

      // 6. Create reward_transactions entry
      await (
        supabase.from(
          "reward_transactions" as "profiles"
        ) as ReturnType<typeof supabase.from>
      ).insert({
        user_id: claim.user_id,
        type: "social_reward",
        amount: claim.discount_amount,
        balance_after: newBalance,
        reference_id: claim.id,
        reference_type: "social_claim_verification",
        notes: `Social reward verified - ${ACTION_TYPE_LABELS[claim.action_type] || claim.action_type}`,
      } as never);

      // 7. Send verification email (non-blocking)
      fetch("/api/notifications/social-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verified",
          clientEmail: claim.clientEmail,
          clientName: claim.clientName,
          actionType: claim.action_type,
          discountAmount: claim.discount_amount,
          totalBalance: newBalance,
        }),
      }).catch(console.error);

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Verify error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (claim.status !== "pending") return;

    setProcessing(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Update social_claims: status='rejected', rejection_reason
      await (
        supabase.from(
          "social_claims" as "profiles"
        ) as ReturnType<typeof supabase.from>
      )
        .update({
          status: "rejected",
          rejection_reason: reason,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        } as never)
        .eq("id", claim.id);

      // Send rejection email (non-blocking)
      fetch("/api/notifications/social-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rejected",
          clientEmail: claim.clientEmail,
          clientName: claim.clientName,
          actionType: claim.action_type,
          rejectionReason: reason,
        }),
      }).catch(console.error);

      setRejecting(false);
      setRejectReason("");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Reject error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: SocialClaimEntry["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Social Claim</DialogTitle>
          <DialogDescription>
            Review the social media engagement claim from {claim.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Claim Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium">{claim.clientName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Action Type</p>
              <p className="font-medium">
                {ACTION_TYPE_LABELS[claim.action_type] || claim.action_type}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Username</p>
              <p className="font-medium">{claim.social_username || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reward Amount</p>
              <p className="font-medium">
                {formatCurrency(claim.discount_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              {statusBadge(claim.status)}
            </div>
            <div>
              <p className="text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {new Date(claim.created_at).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Social URL for manual verification */}
          {claim.socialUrl && (
            <div>
              <a
                href={claim.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Verify on Platform
              </a>
            </div>
          )}

          {/* Screenshot */}
          {screenshotUrl && (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={screenshotUrl}
                alt="Screenshot proof"
                className="w-full max-h-96 object-contain bg-muted"
              />
            </div>
          )}

          {/* Rejection reason display for already rejected claims */}
          {claim.status === "rejected" && claim.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">
                Rejection Reason:
              </p>
              <p className="text-sm text-red-700">{claim.rejection_reason}</p>
            </div>
          )}

          {/* Actions for pending claims only */}
          {claim.status === "pending" && !rejecting && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                className="text-red-700 border-red-200 hover:bg-red-50"
                disabled={processing}
                onClick={() => setRejecting(true)}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={processing}
                onClick={handleVerify}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Verify
              </Button>
            </div>
          )}

          {/* Rejection form */}
          {rejecting && (
            <div className="space-y-3 pt-4">
              <textarea
                className="w-full border rounded p-2 text-sm"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!rejectReason.trim() || processing}
                  onClick={() => handleReject(rejectReason)}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
