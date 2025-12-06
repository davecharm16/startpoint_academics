"use client";

import { Check } from "lucide-react";

const STEPS = [
  { status: "submitted", label: "Submitted" },
  { status: "validated", label: "Payment Verified" },
  { status: "assigned", label: "Writer Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "review", label: "Under Review" },
  { status: "complete", label: "Complete" },
];

const STATUS_ORDER: Record<string, number> = {
  submitted: 0,
  validated: 1,
  assigned: 2,
  in_progress: 3,
  review: 4,
  complete: 5,
  paid: 6,
  cancelled: -1,
  rejected: -1,
};

interface StatusStepperProps {
  currentStatus: string;
}

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = STATUS_ORDER[currentStatus] ?? -1;
  const isRejectedOrCancelled = currentStatus === "rejected" || currentStatus === "cancelled";

  if (isRejectedOrCancelled) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-center">
        <p className="text-lg font-medium text-red-800">
          {currentStatus === "rejected"
            ? "Payment Rejected"
            : "Project Cancelled"}
        </p>
        <p className="text-sm text-red-600 mt-2">
          {currentStatus === "rejected"
            ? "Please check your email for details on how to resubmit payment."
            : "This project has been cancelled."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex-1 relative">
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    isComplete ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}

              {/* Step Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary/20 border-2 border-primary text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-2 text-xs text-center whitespace-nowrap ${
                    isComplete || isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden space-y-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 border-2 border-primary text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  isComplete || isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
