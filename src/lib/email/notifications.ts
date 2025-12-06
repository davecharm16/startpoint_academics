import { sendEmail } from "./resend";
import {
  submissionConfirmationEmail,
  paymentValidatedEmail,
  paymentRejectedEmail,
  writerAssignedClientEmail,
  writerAssignedWriterEmail,
  projectCompletionEmail,
  deadlineWarningWriterEmail,
  deadlineWarningAdminEmail,
} from "./templates";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Submission confirmation to client
export async function notifySubmissionConfirmation(data: {
  clientEmail: string;
  clientName: string;
  referenceCode: string;
  trackingToken: string;
  topic: string;
  packageName: string;
  deadline: Date;
  agreedPrice: number;
}) {
  const { subject, html } = submissionConfirmationEmail({
    ...data,
    trackingUrl: `${BASE_URL}/track/${data.trackingToken}`,
  });

  return sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}

// Payment validated notification to client
export async function notifyPaymentValidated(data: {
  clientEmail: string;
  clientName: string;
  referenceCode: string;
  trackingToken: string;
  amountValidated: number;
}) {
  const { subject, html } = paymentValidatedEmail({
    ...data,
    trackingUrl: `${BASE_URL}/track/${data.trackingToken}`,
  });

  return sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}

// Payment rejected notification to client
export async function notifyPaymentRejected(data: {
  clientEmail: string;
  clientName: string;
  referenceCode: string;
  trackingToken: string;
  rejectionReason: string;
}) {
  const { subject, html } = paymentRejectedEmail({
    ...data,
    trackingUrl: `${BASE_URL}/track/${data.trackingToken}`,
  });

  return sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}

// Writer assigned notifications (both client and writer)
export async function notifyWriterAssigned(data: {
  // Client info
  clientEmail: string;
  clientName: string;
  // Writer info
  writerEmail: string;
  writerName: string;
  // Project info
  referenceCode: string;
  trackingToken: string;
  topic: string;
  packageName: string;
  deadline: Date;
  requirements: string;
  specialInstructions: string | null;
  writerShare: number;
  projectId: string;
}) {
  // Notify client
  const clientEmail = writerAssignedClientEmail({
    clientName: data.clientName,
    referenceCode: data.referenceCode,
    trackingUrl: `${BASE_URL}/track/${data.trackingToken}`,
  });

  // Notify writer
  const writerEmail = writerAssignedWriterEmail({
    writerName: data.writerName,
    referenceCode: data.referenceCode,
    topic: data.topic,
    packageName: data.packageName,
    deadline: data.deadline,
    requirements: data.requirements,
    specialInstructions: data.specialInstructions,
    writerShare: data.writerShare,
    dashboardUrl: `${BASE_URL}/writer/projects/${data.projectId}`,
  });

  // Send both emails
  const [clientResult, writerResult] = await Promise.all([
    sendEmail({
      to: data.clientEmail,
      subject: clientEmail.subject,
      html: clientEmail.html,
    }),
    sendEmail({
      to: data.writerEmail,
      subject: writerEmail.subject,
      html: writerEmail.html,
    }),
  ]);

  return { clientResult, writerResult };
}

// Project completion notification to client
export async function notifyProjectCompletion(data: {
  clientEmail: string;
  clientName: string;
  referenceCode: string;
  trackingToken: string;
  topic: string;
}) {
  const { subject, html } = projectCompletionEmail({
    ...data,
    trackingUrl: `${BASE_URL}/track/${data.trackingToken}`,
  });

  return sendEmail({
    to: data.clientEmail,
    subject,
    html,
  });
}

// Deadline warning to writer
export async function notifyDeadlineWarningWriter(data: {
  writerEmail: string;
  writerName: string;
  referenceCode: string;
  topic: string;
  deadline: Date;
  currentStatus: string;
  projectId: string;
}) {
  const { subject, html } = deadlineWarningWriterEmail({
    ...data,
    dashboardUrl: `${BASE_URL}/writer/projects/${data.projectId}`,
  });

  return sendEmail({
    to: data.writerEmail,
    subject,
    html,
  });
}

// Deadline warning to admin
export async function notifyDeadlineWarningAdmin(data: {
  adminEmail: string;
  referenceCode: string;
  topic: string;
  clientName: string;
  writerName: string;
  deadline: Date;
  currentStatus: string;
  hoursRemaining: number;
  projectId: string;
}) {
  const { subject, html } = deadlineWarningAdminEmail({
    ...data,
    dashboardUrl: `${BASE_URL}/admin/projects/${data.projectId}`,
  });

  return sendEmail({
    to: data.adminEmail,
    subject,
    html,
  });
}
