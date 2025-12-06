"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              "relative",
              index !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
            )}
          >
            {/* Connector line */}
            {index !== steps.length - 1 && (
              <div
                className="absolute top-4 left-7 -ml-px w-full h-0.5 bg-muted"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-300",
                    currentStep > step.id ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}

            <div className="relative flex items-start group">
              <span className="flex h-9 items-center" aria-hidden="true">
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </span>
              </span>
              <span className="ml-3 flex min-w-0 flex-col">
                <span
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </span>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
