"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntakeFormData } from "../intake-form";

export function ContactInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ll use this to send you updates and your tracking link.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="client_name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="client_name"
            placeholder="Juan Dela Cruz"
            {...register("client_name")}
            aria-invalid={errors.client_name ? "true" : "false"}
          />
          {errors.client_name && (
            <p className="text-sm text-destructive">
              {errors.client_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="client_email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="client_email"
            type="email"
            placeholder="juan@example.com"
            {...register("client_email")}
            aria-invalid={errors.client_email ? "true" : "false"}
          />
          {errors.client_email && (
            <p className="text-sm text-destructive">
              {errors.client_email.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive your tracking link and updates here.
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="client_phone">
            Mobile Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="client_phone"
            type="tel"
            placeholder="09171234567"
            {...register("client_phone")}
            aria-invalid={errors.client_phone ? "true" : "false"}
          />
          {errors.client_phone && (
            <p className="text-sm text-destructive">
              {errors.client_phone.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Philippine mobile number starting with 09. Used for verification.
          </p>
        </div>
      </div>
    </div>
  );
}
