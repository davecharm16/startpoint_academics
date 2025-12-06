"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, AlertCircle } from "lucide-react";

const settingsSchema = z.object({
  downpayment_type: z.enum(["percentage", "fixed"]),
  downpayment_value: z.number().min(0),
  minimum_downpayment: z.number().min(0).nullable(),
  screenshot_required: z.boolean(),
  reference_required: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface PaymentSettings {
  id: string;
  downpayment_type: "percentage" | "fixed";
  downpayment_value: number;
  minimum_downpayment: number | null;
  screenshot_required: boolean;
  reference_required: boolean;
  accepted_file_types: string[];
  updated_at: string;
}

interface PaymentSettingsFormProps {
  settings: PaymentSettings | null;
}

export function PaymentSettingsForm({ settings }: PaymentSettingsFormProps) {
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
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      downpayment_type: settings?.downpayment_type || "percentage",
      downpayment_value: settings?.downpayment_value || 50,
      minimum_downpayment: settings?.minimum_downpayment || null,
      screenshot_required: settings?.screenshot_required ?? true,
      reference_required: settings?.reference_required ?? false,
    },
  });

  const downpaymentType = watch("downpayment_type");
  const screenshotRequired = watch("screenshot_required");
  const referenceRequired = watch("reference_required");

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      if (settings?.id) {
        // Update existing settings
        const { error: updateError } = await (supabase
          .from("payment_settings") as ReturnType<typeof supabase.from>)
          .update({
            downpayment_type: data.downpayment_type,
            downpayment_value: data.downpayment_value,
            minimum_downpayment: data.minimum_downpayment,
            screenshot_required: data.screenshot_required,
            reference_required: data.reference_required,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", settings.id);

        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { error: insertError } = await (supabase
          .from("payment_settings") as ReturnType<typeof supabase.from>)
          .insert({
            downpayment_type: data.downpayment_type,
            downpayment_value: data.downpayment_value,
            minimum_downpayment: data.minimum_downpayment,
            screenshot_required: data.screenshot_required,
            reference_required: data.reference_required,
          } as never);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Settings save error:", err);
      setError("Failed to save settings. Please try again.");
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
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Downpayment Type */}
      <div className="space-y-2">
        <Label htmlFor="downpayment_type">Downpayment Type</Label>
        <Select
          value={downpaymentType}
          onValueChange={(value: "percentage" | "fixed") =>
            setValue("downpayment_type", value)
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
          {downpaymentType === "percentage"
            ? "Downpayment will be calculated as a percentage of the agreed price"
            : "Downpayment will be a fixed amount regardless of project price"}
        </p>
      </div>

      {/* Downpayment Value */}
      <div className="space-y-2">
        <Label htmlFor="downpayment_value">
          Downpayment {downpaymentType === "percentage" ? "Percentage" : "Amount"}
        </Label>
        <div className="relative">
          <Input
            id="downpayment_value"
            type="number"
            {...register("downpayment_value", { valueAsNumber: true })}
            className={downpaymentType === "percentage" ? "pr-8" : ""}
          />
          {downpaymentType === "percentage" && (
            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
          )}
        </div>
        {errors.downpayment_value && (
          <p className="text-sm text-destructive">
            {errors.downpayment_value.message}
          </p>
        )}
      </div>

      {/* Minimum Downpayment */}
      {downpaymentType === "percentage" && (
        <div className="space-y-2">
          <Label htmlFor="minimum_downpayment">
            Minimum Downpayment (PHP, optional)
          </Label>
          <Input
            id="minimum_downpayment"
            type="number"
            {...register("minimum_downpayment", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            placeholder="e.g., 500"
          />
          <p className="text-sm text-muted-foreground">
            Minimum amount regardless of calculated percentage
          </p>
        </div>
      )}

      {/* Screenshot Required */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Require Payment Screenshot</Label>
          <p className="text-sm text-muted-foreground">
            Clients must upload proof of payment
          </p>
        </div>
        <Switch
          checked={screenshotRequired}
          onCheckedChange={(checked) => setValue("screenshot_required", checked)}
        />
      </div>

      {/* Reference Required */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Require Reference Number</Label>
          <p className="text-sm text-muted-foreground">
            Clients must provide transaction reference
          </p>
        </div>
        <Switch
          checked={referenceRequired}
          onCheckedChange={(checked) => setValue("reference_required", checked)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
