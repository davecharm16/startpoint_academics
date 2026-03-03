"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@startpoint/supabase/client";
import { Button, Input, Label, Alert, AlertDescription, Badge } from "@startpoint/ui";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  userId: string;
  fullName: string;
  phone: string;
  referralCode: string | null;
}

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm({ userId, fullName, phone, referralCode }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName,
      phone,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await (
        supabase.from("profiles") as ReturnType<typeof supabase.from>
      )
        .update({ full_name: data.fullName, phone: data.phone || null } as never)
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>Profile updated successfully.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Your full name"
          {...register("fullName")}
          disabled={isLoading}
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="+63 912 345 6789"
          {...register("phone")}
          disabled={isLoading}
        />
      </div>

      {referralCode && (
        <div className="space-y-2">
          <Label>Referral Code</Label>
          <div>
            <Badge variant="secondary">{referralCode}</Badge>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
