import { emailLayout } from "./layout";
import { format, formatDistanceToNow } from "date-fns";

interface DeadlineWarningData {
  writerName: string;
  referenceCode: string;
  topic: string;
  deadline: Date;
  currentStatus: string;
  dashboardUrl: string;
}

interface AdminDeadlineWarningData {
  referenceCode: string;
  topic: string;
  clientName: string;
  writerName: string;
  deadline: Date;
  currentStatus: string;
  hoursRemaining: number;
  dashboardUrl: string;
}

export function deadlineWarningWriterEmail(data: DeadlineWarningData) {
  const formattedDeadline = format(data.deadline, "MMMM d, yyyy 'at' h:mm a");
  const timeRemaining = formatDistanceToNow(data.deadline, { addSuffix: true });

  const content = `
    <h2>Deadline Approaching!</h2>
    <p>Dear ${data.writerName},</p>
    <p>This is a reminder that the following project deadline is approaching:</p>

    <div class="warning-box">
      <div class="label">Time Remaining</div>
      <div class="value">${timeRemaining}</div>
    </div>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>Project Details</h2>
    <p><strong>Topic:</strong> ${data.topic}</p>
    <p><strong>Deadline:</strong> ${formattedDeadline}</p>
    <p><strong>Current Status:</strong> ${data.currentStatus.replace("_", " ")}</p>

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">View Project</a>
    </p>

    <p>Please ensure you complete and submit the project before the deadline. If you anticipate any issues meeting the deadline, please contact the admin team immediately.</p>
  `;

  return {
    subject: `Deadline Alert: ${data.referenceCode} due ${timeRemaining}`,
    html: emailLayout(content),
  };
}

export function deadlineWarningAdminEmail(data: AdminDeadlineWarningData) {
  const formattedDeadline = format(data.deadline, "MMMM d, yyyy 'at' h:mm a");
  const urgencyClass = data.hoursRemaining <= 12 ? "error-box" : "warning-box";

  const content = `
    <h2>Project Deadline Alert</h2>
    <p>The following project has a deadline approaching and requires attention:</p>

    <div class="${urgencyClass}">
      <div class="label">Hours Remaining</div>
      <div class="value">${data.hoursRemaining} hours</div>
    </div>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>Project Details</h2>
    <p><strong>Topic:</strong> ${data.topic}</p>
    <p><strong>Client:</strong> ${data.clientName}</p>
    <p><strong>Writer:</strong> ${data.writerName}</p>
    <p><strong>Deadline:</strong> ${formattedDeadline}</p>
    <p><strong>Current Status:</strong> ${data.currentStatus.replace("_", " ")}</p>

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">View in Admin</a>
    </p>

    <p>Please review this project and take appropriate action if needed.</p>
  `;

  return {
    subject: `⚠️ Deadline Alert: ${data.referenceCode} - ${data.hoursRemaining}h remaining`,
    html: emailLayout(content),
  };
}
