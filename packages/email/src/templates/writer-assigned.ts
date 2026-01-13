import { emailLayout } from "./layout";
import { format } from "date-fns";

interface WriterAssignedClientData {
  clientName: string;
  referenceCode: string;
  trackingUrl: string;
}

interface WriterAssignedWriterData {
  writerName: string;
  referenceCode: string;
  topic: string;
  packageName: string;
  deadline: Date;
  requirements: string;
  specialInstructions: string | null;
  writerShare: number;
  dashboardUrl: string;
}

export function writerAssignedClientEmail(data: WriterAssignedClientData) {
  const content = `
    <h2>Writer Assigned to Your Project!</h2>
    <p>Dear ${data.clientName},</p>
    <p>Great news! A qualified writer has been assigned to your project and work will begin shortly.</p>

    <div class="success-box">
      <strong>Your project is now in progress!</strong><br />
      A skilled academic writer has been assigned and will start working on your requirements.
    </div>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>What's Next?</h2>
    <p>1. The writer will review your requirements</p>
    <p>2. Work will progress according to your deadline</p>
    <p>3. You'll receive updates on significant milestones</p>
    <p>4. Once complete, you'll be notified to download your files</p>

    <p style="text-align: center;">
      <a href="${data.trackingUrl}" class="button">Track Your Project</a>
    </p>

    <p>Thank you for your patience and trust in Startpoint Academics!</p>
  `;

  return {
    subject: `Writer Assigned: ${data.referenceCode} - Startpoint Academics`,
    html: emailLayout(content),
  };
}

export function writerAssignedWriterEmail(data: WriterAssignedWriterData) {
  const formattedDeadline = format(data.deadline, "MMMM d, yyyy 'at' h:mm a");
  const formattedShare = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(data.writerShare);

  const content = `
    <h2>New Project Assigned!</h2>
    <p>Dear ${data.writerName},</p>
    <p>You have been assigned a new project. Please review the details below and begin work promptly.</p>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>Project Details</h2>
    <p><strong>Topic:</strong> ${data.topic}</p>
    <p><strong>Package:</strong> ${data.packageName}</p>
    <p><strong>Deadline:</strong> ${formattedDeadline}</p>
    <p><strong>Your Earnings:</strong> ${formattedShare}</p>

    ${data.specialInstructions ? `
    <div class="warning-box">
      <strong>Special Instructions:</strong><br />
      ${data.specialInstructions}
    </div>
    ` : ""}

    <hr />

    <h2>Requirements</h2>
    <p>${data.requirements}</p>

    <p style="text-align: center;">
      <a href="${data.dashboardUrl}" class="button">View in Dashboard</a>
    </p>

    <div class="warning-box">
      <strong>Important:</strong> Please update the project status in your dashboard as you progress. This helps keep the client informed and ensures smooth delivery.
    </div>
  `;

  return {
    subject: `New Assignment: ${data.referenceCode} - Startpoint Academics`,
    html: emailLayout(content),
  };
}
