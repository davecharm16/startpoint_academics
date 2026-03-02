"use client";

import { useState } from "react";
import { Card, CardContent } from "@startpoint/ui";
import { Button } from "@startpoint/ui";
import { Copy, Check, Link as LinkIcon } from "lucide-react";

export interface ReferralCodeCardProps {
  referralCode: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  rewardType: "percentage" | "fixed";
  rewardValue: number;
}

export function ReferralCodeCard({
  referralCode,
  discountType,
  discountValue,
  rewardType,
  rewardValue,
}: ReferralCodeCardProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";

  const shareableUrl = `${baseUrl}/auth/register?ref=${referralCode}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const discountText =
    discountType === "percentage"
      ? `they get ${discountValue}% off`
      : `they get ${formatCurrency(discountValue)} off`;

  const rewardText =
    rewardType === "percentage"
      ? `you earn ${rewardValue}% of their order`
      : `you earn ${formatCurrency(rewardValue)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold">Your Referral Code</h3>
            <p className="text-sm text-muted-foreground">
              Share this code with friends &mdash; {discountText}, {rewardText}!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                {referralCode}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="gap-2"
              >
                {codeCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground break-all">
            <span className="font-medium">Shareable link: </span>
            {shareableUrl}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
