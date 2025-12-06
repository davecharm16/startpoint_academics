"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeFormData } from "../intake-form";

export function ProjectDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Project Details</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your academic project.
        </p>
      </div>

      <div className="space-y-4">
        {/* Topic */}
        <div className="space-y-2">
          <Label htmlFor="topic">
            Topic / Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="topic"
            placeholder="e.g., The Impact of Social Media on Mental Health"
            {...register("topic")}
            aria-invalid={errors.topic ? "true" : "false"}
          />
          {errors.topic && (
            <p className="text-sm text-destructive">{errors.topic.message}</p>
          )}
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline">
            Deadline <span className="text-destructive">*</span>
          </Label>
          <Input
            id="deadline"
            type="date"
            min={minDate}
            {...register("deadline")}
            aria-invalid={errors.deadline ? "true" : "false"}
          />
          {errors.deadline && (
            <p className="text-sm text-destructive">{errors.deadline.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Please allow enough time for quality work.
          </p>
        </div>

        {/* Expected Outputs */}
        <div className="space-y-2">
          <Label htmlFor="expected_outputs">
            Expected Outputs <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="expected_outputs"
            placeholder="Describe what you expect to receive (e.g., 10-page research paper with APA citations, presentation slides, executive summary)"
            rows={4}
            {...register("expected_outputs")}
            aria-invalid={errors.expected_outputs ? "true" : "false"}
          />
          {errors.expected_outputs && (
            <p className="text-sm text-destructive">
              {errors.expected_outputs.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
