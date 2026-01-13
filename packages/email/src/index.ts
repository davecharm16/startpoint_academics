// Core email sending functionality
export { sendEmail, sendBatchEmails } from "./resend";
export type { EmailOptions } from "./resend";

// High-level notification functions
export {
  notifySubmissionConfirmation,
  notifyPaymentValidated,
  notifyPaymentRejected,
  notifyWriterAssigned,
  notifyProjectCompletion,
  notifyDeadlineWarningWriter,
  notifyDeadlineWarningAdmin,
} from "./notifications";

// Email templates
export * from "./templates";
