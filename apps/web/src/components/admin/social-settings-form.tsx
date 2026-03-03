"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@startpoint/supabase/client";
import { Button } from "@startpoint/ui";
import { Input } from "@startpoint/ui";
import { Label } from "@startpoint/ui";
import { Switch } from "@startpoint/ui";
import { Alert, AlertDescription } from "@startpoint/ui";
import { Loader2, Check, AlertCircle } from "lucide-react";

const actionSchema = z.object({
  is_enabled: z.boolean(),
  discount_amount: z.number().min(0).max(500, "Discount cannot exceed \u20B1500"),
  instruction_text: z.string().max(500, "Instructions too long"),
  social_url: z.string().optional(),
});

const ACTION_LABELS: Record<string, string> = {
  like_page: "Like Our Page",
  follow_page: "Follow Us",
  share_post: "Share a Post",
};

const ACTION_TYPES = ["like_page", "follow_page", "share_post"] as const;

interface SocialAction {
  id: string;
  action_type: "like_page" | "follow_page" | "share_post";
  is_enabled: boolean;
  discount_amount: number;
  instruction_text: string;
  social_url: string;
}

interface SocialSettingsFormProps {
  actions: SocialAction[];
}

interface ActionFormState {
  is_enabled: boolean;
  discount_amount: number;
  instruction_text: string;
  social_url: string;
}

export function SocialSettingsForm({ actions }: SocialSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});

  const [formState, setFormState] = useState<Record<string, ActionFormState>>(
    () => {
      const defaults: Record<string, ActionFormState> = {
        like_page: {
          is_enabled: true,
          discount_amount: 50,
          instruction_text: "",
          social_url: "",
        },
        follow_page: {
          is_enabled: true,
          discount_amount: 50,
          instruction_text: "",
          social_url: "",
        },
        share_post: {
          is_enabled: true,
          discount_amount: 100,
          instruction_text: "",
          social_url: "",
        },
      };

      // Override with existing action data
      for (const action of actions) {
        defaults[action.action_type] = {
          is_enabled: action.is_enabled,
          discount_amount: action.discount_amount,
          instruction_text: action.instruction_text,
          social_url: action.social_url,
        };
      }

      return defaults;
    }
  );

  const updateField = (
    actionType: string,
    field: keyof ActionFormState,
    value: string | number | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      [actionType]: {
        ...prev[actionType],
        [field]: value,
      },
    }));
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const actionErrors = { ...prev[actionType] };
      delete actionErrors[field];
      return { ...prev, [actionType]: actionErrors };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate all actions
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    for (const actionType of ACTION_TYPES) {
      const values = formState[actionType];
      const result = actionSchema.safeParse(values);

      if (!result.success) {
        hasErrors = true;
        newErrors[actionType] = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          newErrors[actionType][field] = issue.message;
        }
      }
    }

    if (hasErrors) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      for (const actionType of ACTION_TYPES) {
        const values = formState[actionType];
        const existingAction = actions.find(
          (a) => a.action_type === actionType
        );

        if (existingAction) {
          const { error: updateError } = await (
            supabase.from(
              "social_reward_settings" as "profiles"
            ) as ReturnType<typeof supabase.from>
          )
            .update({
              is_enabled: values.is_enabled,
              discount_amount: values.discount_amount,
              instruction_text: values.instruction_text,
              social_url: values.social_url || "",
              updated_at: new Date().toISOString(),
            } as never)
            .eq("id", existingAction.id);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await (
            supabase.from(
              "social_reward_settings" as "profiles"
            ) as ReturnType<typeof supabase.from>
          ).insert({
            action_type: actionType,
            is_enabled: values.is_enabled,
            discount_amount: values.discount_amount,
            instruction_text: values.instruction_text,
            social_url: values.social_url || "",
          } as never);

          if (insertError) throw insertError;
        }
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Social settings save error:", err);
      setError("Failed to save social settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
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
            Social settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {ACTION_TYPES.map((actionType) => {
        const label = ACTION_LABELS[actionType];
        const values = formState[actionType];
        const errors = validationErrors[actionType] || {};

        return (
          <div key={actionType} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{label}</h3>
              <Switch
                checked={values.is_enabled}
                onCheckedChange={(checked) =>
                  updateField(actionType, "is_enabled", checked)
                }
                aria-label={`Enable ${label}`}
              />
            </div>

            {/* Discount Amount */}
            <div className="space-y-2">
              <Label htmlFor={`${actionType}_discount_amount`}>
                Discount Amount ({"\u20B1"})
              </Label>
              <Input
                id={`${actionType}_discount_amount`}
                type="number"
                value={values.discount_amount}
                onChange={(e) =>
                  updateField(
                    actionType,
                    "discount_amount",
                    Number(e.target.value)
                  )
                }
                min={0}
                max={500}
              />
              {errors.discount_amount && (
                <p className="text-sm text-destructive">
                  {errors.discount_amount}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor={`${actionType}_instruction_text`}>
                Instructions for Clients
              </Label>
              <Input
                id={`${actionType}_instruction_text`}
                value={values.instruction_text}
                onChange={(e) =>
                  updateField(actionType, "instruction_text", e.target.value)
                }
                placeholder="e.g., Like our Facebook page and take a screenshot"
              />
              {errors.instruction_text && (
                <p className="text-sm text-destructive">
                  {errors.instruction_text}
                </p>
              )}
            </div>

            {/* Social URL */}
            <div className="space-y-2">
              <Label htmlFor={`${actionType}_social_url`}>
                Social Media URL
              </Label>
              <Input
                id={`${actionType}_social_url`}
                value={values.social_url}
                onChange={(e) =>
                  updateField(actionType, "social_url", e.target.value)
                }
                placeholder="https://facebook.com/startpointacademics"
              />
              {errors.social_url && (
                <p className="text-sm text-destructive">{errors.social_url}</p>
              )}
            </div>
          </div>
        );
      })}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Social Settings"
        )}
      </Button>
    </form>
  );
}
