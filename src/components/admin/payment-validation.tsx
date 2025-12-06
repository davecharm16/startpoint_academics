"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface PaymentProof {
  id: string;
  type: string;
  storage_path: string;
  amount_claimed: number;
  validated: boolean;
  rejection_reason: string | null;
  created_at: string;
}

interface PaymentValidationProps {
  projectId: string;
  projectReference: string;
  paymentProof: PaymentProof;
  onSuccess?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function PaymentValidation({
  projectId,
  projectReference,
  paymentProof,
  onSuccess,
}: PaymentValidationProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Get signed URL when dialog opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !imageUrl && paymentProof.storage_path) {
      try {
        const supabase = createClient();
        const { data, error: urlError } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(paymentProof.storage_path, 3600); // 1 hour expiry

        if (urlError) throw urlError;
        if (data) setImageUrl(data.signedUrl);
      } catch (err) {
        console.error("Failed to get image URL:", err);
        setImageError(true);
      }
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update payment proof
      const { error: proofError } = await (supabase
        .from("payment_proofs") as ReturnType<typeof supabase.from>)
        .update({ validated: true } as never)
        .eq("id", paymentProof.id);

      if (proofError) throw proofError;

      // Update project status
      const { error: projectError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({ status: "validated" } as never)
        .eq("id", projectId);

      if (projectError) throw projectError;

      // Create audit log
      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "payment_validated",
          old_status: "submitted",
          new_status: "validated",
          notes: `${paymentProof.type} payment validated - ${formatCurrency(paymentProof.amount_claimed)}`,
        } as never);

      // Send email notification (non-blocking)
      fetch("/api/notifications/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "validated",
          amountValidated: paymentProof.amount_claimed,
        }),
      }).catch(console.error);

      setIsOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      console.error("Validation error:", err);
      setError("Failed to validate payment. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update payment proof with rejection reason
      const { error: proofError } = await (supabase
        .from("payment_proofs") as ReturnType<typeof supabase.from>)
        .update({
          validated: false,
          rejection_reason: rejectionReason.trim(),
        } as never)
        .eq("id", paymentProof.id);

      if (proofError) throw proofError;

      // Update project status
      const { error: projectError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({ status: "rejected" } as never)
        .eq("id", projectId);

      if (projectError) throw projectError;

      // Create audit log
      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "payment_rejected",
          old_status: "submitted",
          new_status: "rejected",
          notes: `Payment rejected: ${rejectionReason.trim()}`,
        } as never);

      // Send email notification (non-blocking)
      fetch("/api/notifications/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "rejected",
          rejectionReason: rejectionReason.trim(),
        }),
      }).catch(console.error);

      setIsOpen(false);
      setShowRejectForm(false);
      setRejectionReason("");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      console.error("Rejection error:", err);
      setError("Failed to reject payment. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  // Don't show validation for already processed proofs
  if (paymentProof.validated || paymentProof.rejection_reason) {
    return (
      <Badge
        variant="secondary"
        className={
          paymentProof.validated
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }
      >
        {paymentProof.validated ? "Validated" : "Rejected"}
      </Badge>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payment Validation</DialogTitle>
          <DialogDescription>
            Review {paymentProof.type} payment for {projectReference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Info */}
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Payment Type</p>
              <p className="font-medium capitalize">{paymentProof.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Amount Claimed</p>
              <p className="text-xl font-bold">
                {formatCurrency(paymentProof.amount_claimed)}
              </p>
            </div>
          </div>

          {/* Screenshot Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <p className="text-sm font-medium">Payment Screenshot</p>
            </div>
            <div className="p-4 bg-muted/20 min-h-[300px] flex items-center justify-center">
              {imageError ? (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Failed to load image</p>
                </div>
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Payment proof"
                  width={600}
                  height={400}
                  className="max-w-full max-h-[400px] object-contain rounded"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="space-y-3 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please explain why this payment is being rejected..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason("");
                    setError(null);
                  }}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showRejectForm && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(true)}
                disabled={isValidating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate Payment
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
