"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@startpoint/supabase/client";
import { Button } from "@startpoint/ui";
import { Input } from "@startpoint/ui";
import { Label } from "@startpoint/ui";
import { Switch } from "@startpoint/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@startpoint/ui";
import { Alert, AlertDescription } from "@startpoint/ui";
import { Loader2, Check, AlertCircle } from "lucide-react";

const referralSettingsSchema = z
  .object({
    program_enabled: z.boolean(),
    new_client_discount_type: z.enum(["percentage", "fixed"]),
    new_client_discount_value: z.number().min(0),
    referrer_reward_type: z.enum(["percentage", "fixed"]),
    referrer_reward_value: z.number().min(0).max(1000, "Reward cannot exceed ₱1,000"),
    minimum_payout: z.number().min(100, "Minimum payout must be at least ₱100"),
  })
  .refine(
    (data) => {
      if (data.new_client_discount_type === "percentage") {
        return data.new_client_discount_value <= 50;
      }
      return true;
    },
    {
      message: "Discount cannot exceed 50%",
      path: ["new_client_discount_value"],
    }
  );

type ReferralSettingsFormData = z.infer<typeof referralSettingsSchema>;

interface ReferralSettings {
  id: string;
  program_enabled: boolean;
  new_client_discount_type: "percentage" | "fixed";
  new_client_discount_value: number;
  referrer_reward_type: "percentage" | "fixed";
  referrer_reward_value: number;
  minimum_payout: number;
  updated_at: string;
}

interface ReferralSettingsFormProps {
  settings: ReferralSettings | null;
}

export function ReferralSettingsForm({ settings }: ReferralSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReferralSettingsFormData>({
    resolver: zodResolver(referralSettingsSchema),
    defaultValues: {
      program_enabled: settings?.program_enabled ?? true,
      new_client_discount_type: settings?.new_client_discount_type || "percentage",
      new_client_discount_value: settings?.new_client_discount_value ?? 10,
      referrer_reward_type: settings?.referrer_reward_type || "fixed",
      referrer_reward_value: settings?.referrer_reward_value ?? 100,
      minimum_payout: settings?.minimum_payout ?? 500,
    },
  });

  const programEnabled = watch("program_enabled");
  const discountType = watch("new_client_discount_type");
  const rewardType = watch("referrer_reward_type");

  const onSubmit = async (data: ReferralSettingsFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      if (settings?.id) {
        // Update existing settings
        const { error: updateError } = await (supabase
          .from("referral_settings") as ReturnType<typeof supabase.from>)
          .update({
            program_enabled: data.program_enabled,
            new_client_discount_type: data.new_client_discount_type,
            new_client_discount_value: data.new_client_discount_value,
            referrer_reward_type: data.referrer_reward_type,
            referrer_reward_value: data.referrer_reward_value,
            minimum_payout: data.minimum_payout,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", settings.id);

        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { error: insertError } = await (supabase
          .from("referral_settings") as ReturnType<typeof supabase.from>)
          .insert({
            program_enabled: data.program_enabled,
            new_client_discount_type: data.new_client_discount_type,
            new_client_discount_value: data.new_client_discount_value,
            referrer_reward_type: data.referrer_reward_type,
            referrer_reward_value: data.referrer_reward_value,
            minimum_payout: data.minimum_payout,
          } as never);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Referral settings save error:", err);
      setError("Failed to save referral settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Referral settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Program Enabled */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Enable Referral Program</Label>
          <p className="text-sm text-muted-foreground">
            Allow clients to refer others and earn rewards
          </p>
        </div>
        <Switch
          checked={programEnabled}
          onCheckedChange={(checked) => setValue("program_enabled", checked)}
        />
      </div>

      {/* New Client Discount Type */}
      <div className="space-y-2">
        <Label htmlFor="new_client_discount_type">New Client Discount Type</Label>
        <Select
          value={discountType}
          onValueChange={(value: "percentage" | "fixed") =>
            setValue("new_client_discount_type", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage of Total</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {discountType === "percentage"
            ? "New referred clients get a percentage discount on their first order"
            : "New referred clients get a fixed amount discount on their first order"}
        </p>
      </div>

      {/* New Client Discount Value */}
      <div className="space-y-2">
        <Label htmlFor="new_client_discount_value">
          Discount {discountType === "percentage" ? "Percentage" : "Amount (₱)"}
        </Label>
        <div className="relative">
          <Input
            id="new_client_discount_value"
            type="number"
            {...register("new_client_discount_value", { valueAsNumber: true })}
            className={discountType === "percentage" ? "pr-8" : ""}
          />
          {discountType === "percentage" && (
            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
          )}
        </div>
        {errors.new_client_discount_value && (
          <p className="text-sm text-destructive">
            {errors.new_client_discount_value.message}
          </p>
        )}
      </div>

      {/* Referrer Reward Type */}
      <div className="space-y-2">
        <Label htmlFor="referrer_reward_type">Referrer Reward Type</Label>
        <Select
          value={rewardType}
          onValueChange={(value: "percentage" | "fixed") =>
            setValue("referrer_reward_type", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed Amount (₱)</SelectItem>
            <SelectItem value="percentage">Percentage of Order</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {rewardType === "fixed"
            ? "Referrers earn a fixed amount for each successful referral"
            : "Referrers earn a percentage of the referred order total"}
        </p>
      </div>

      {/* Referrer Reward Value */}
      <div className="space-y-2">
        <Label htmlFor="referrer_reward_value">
          Reward {rewardType === "fixed" ? "Amount (₱)" : "Percentage"}
        </Label>
        <div className="relative">
          <Input
            id="referrer_reward_value"
            type="number"
            {...register("referrer_reward_value", { valueAsNumber: true })}
            className={rewardType === "percentage" ? "pr-8" : ""}
          />
          {rewardType === "percentage" && (
            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
          )}
        </div>
        {errors.referrer_reward_value && (
          <p className="text-sm text-destructive">
            {errors.referrer_reward_value.message}
          </p>
        )}
      </div>

      {/* Minimum Payout Amount */}
      <div className="space-y-2">
        <Label htmlFor="minimum_payout">Minimum Payout Amount (₱)</Label>
        <Input
          id="minimum_payout"
          type="number"
          {...register("minimum_payout", { valueAsNumber: true })}
        />
        <p className="text-sm text-muted-foreground">
          Minimum earned balance before a referrer can request a payout
        </p>
        {errors.minimum_payout && (
          <p className="text-sm text-destructive">
            {errors.minimum_payout.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Referral Settings"
        )}
      </Button>
    </form>
  );
}
