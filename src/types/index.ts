// Re-export database types
export * from "./database";

// Application-specific types

export interface RequiredField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  required: boolean;
  options?: string[];
}

export type ProjectStatus =
  | "submitted"
  | "pending_payment_validation"
  | "validated"
  | "rejected"
  | "assigned"
  | "in_progress"
  | "review"
  | "complete"
  | "paid";

export const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  submitted: ["pending_payment_validation"],
  pending_payment_validation: ["validated", "rejected"],
  validated: ["assigned"],
  rejected: ["pending_payment_validation"],
  assigned: ["in_progress"],
  in_progress: ["review"],
  review: ["complete", "in_progress"],
  complete: ["paid"],
  paid: [],
};

export function canTransition(
  from: ProjectStatus,
  to: ProjectStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
