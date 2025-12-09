"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import type { IntakeFormData } from "../intake-form";

interface PaymentSettings {
  id: string;
  downpayment_type: "percentage" | "fixed";
  downpayment_value: number;
  screenshot_required: boolean;
  reference_required: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  account_name: string;
  account_number: string;
  is_enabled: boolean;
  display_order: number;
}

interface PaymentStepProps {
  downpaymentAmount: number;
  paymentSettings: PaymentSettings | null;
  paymentMethods: PaymentMethod[];
  onScreenshotChange: (file: File | null) => void;
  formatPrice: (amount: number) => string;
}

export function PaymentStep({
  downpaymentAmount,
  paymentSettings,
  paymentMethods,
  onScreenshotChange,
  formatPrice,
}: PaymentStepProps) {
  const { register, setValue, watch } = useFormContext<IntakeFormData>();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const selectedMethodId = watch("payment_method_id");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPG, PNG, or WebP image");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      onScreenshotChange(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    onScreenshotChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <p className="text-sm text-muted-foreground">
          Please make your downpayment and upload proof of payment.
        </p>
      </div>

      {/* Downpayment Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Required Downpayment</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(downpaymentAmount)}
            </span>
          </div>
          {paymentSettings && paymentSettings.downpayment_type === "percentage" && (
            <p className="text-xs text-muted-foreground mt-1">
              {paymentSettings.downpayment_value}% of total price
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <div className="space-y-3">
          <Label>Select Payment Method</Label>
          <RadioGroup
            value={selectedMethodId}
            onValueChange={(value) => setValue("payment_method_id", value)}
          >
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                htmlFor={method.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethodId === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                <div className="flex-1">
                  <span className="cursor-pointer font-medium">
                    {method.name}
                  </span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <p>{method.account_name}</p>
                    <p className="font-mono">{method.account_number}</p>
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Amount Paid */}
      <div className="space-y-2">
        <Label htmlFor="amount_paid">Amount Paid (optional)</Label>
        <Input
          id="amount_paid"
          type="number"
          placeholder="Enter amount paid"
          {...register("amount_paid", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Enter the exact amount you sent for verification.
        </p>
      </div>

      {/* Screenshot Upload */}
      {paymentSettings?.screenshot_required !== false && (
        <div className="space-y-2">
          <Label>
            Payment Screenshot
            {paymentSettings?.screenshot_required && (
              <span className="text-destructive"> *</span>
            )}
          </Label>

          {!previewUrl ? (
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">
                  Click to upload screenshot
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or WebP (max 5MB)
                </span>
              </label>
            </div>
          ) : (
            <div className="relative border rounded-lg p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Payment screenshot preview"
                className="max-h-48 mx-auto rounded"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full text-xs"
              >
                Remove
              </button>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Screenshot uploaded
              </div>
            </div>
          )}
        </div>
      )}

      {/* Important Notice */}
      <div className="flex gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Important:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Your payment will be verified by our team</li>
            <li>You&apos;ll receive a confirmation email once validated</li>
            <li>Work begins after payment verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
