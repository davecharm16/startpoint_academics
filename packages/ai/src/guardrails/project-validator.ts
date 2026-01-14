/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Project status type
 */
type ProjectStatus =
  | "submitted"
  | "paid"
  | "assigned"
  | "in_progress"
  | "review"
  | "revision"
  | "complete"
  | "cancelled";

/**
 * Minimal project info for validation
 */
export interface ProjectInfo {
  id: string;
  status: ProjectStatus;
  writerId: string | null;
  deadline: string;
}

/**
 * Statuses where the agent can be used
 */
const ALLOWED_STATUSES: ProjectStatus[] = [
  "assigned",
  "in_progress",
  "review",
  "revision",
];

/**
 * Validate that a project can use the writing agent
 */
export function validateProject(
  project: ProjectInfo | null,
  writerId: string
): ValidationResult {
  if (!project) {
    return {
      valid: false,
      error: "Please select a project before using the writing assistant.",
    };
  }

  // Check if writer is assigned to this project
  if (project.writerId !== writerId) {
    return {
      valid: false,
      error: "You are not assigned to this project.",
    };
  }

  // Check project status
  if (!ALLOWED_STATUSES.includes(project.status)) {
    return {
      valid: false,
      error: `Cannot use writing assistant for projects with status "${project.status}". Project must be assigned, in progress, or in review.`,
    };
  }

  // Check if project is past deadline (soft warning, still allow)
  const deadline = new Date(project.deadline);
  const now = new Date();
  if (now > deadline) {
    // Allow but could be used for warnings
    return {
      valid: true,
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validate session ownership
 */
export function validateSessionOwnership(
  sessionWriterId: string,
  currentWriterId: string
): ValidationResult {
  if (sessionWriterId !== currentWriterId) {
    return {
      valid: false,
      error: "You do not have access to this session.",
    };
  }

  return {
    valid: true,
  };
}
