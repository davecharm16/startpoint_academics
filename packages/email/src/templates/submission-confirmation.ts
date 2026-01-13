import { emailLayout } from "./layout";
import { format } from "date-fns";

interface SubmissionConfirmationData {
  clientName: string;
  referenceCode: string;
  trackingToken: string;
  topic: string;
  packageName: string;
  deadline: Date;
  agreedPrice: number;
  trackingUrl: string;
}

export function submissionConfirmationEmail(data: SubmissionConfirmationData) {
  const formattedDeadline = format(data.deadline, "MMMM d, yyyy 'at' h:mm a");
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(data.agreedPrice);

  const content = `
    <h2>Thank You for Your Submission!</h2>
    <p>Dear ${data.clientName},</p>
    <p>We have received your project submission and our team is reviewing it. Please save your reference code for future inquiries.</p>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>Project Details</h2>
    <p><strong>Topic:</strong> ${data.topic}</p>
    <p><strong>Package:</strong> ${data.packageName}</p>
    <p><strong>Deadline:</strong> ${formattedDeadline}</p>
    <p><strong>Price:</strong> ${formattedPrice}</p>

    <hr />

    <h2>What's Next?</h2>
    <p>1. Our admin team will validate your payment proof</p>
    <p>2. Once validated, a writer will be assigned to your project</p>
    <p>3. You'll receive updates as your project progresses</p>

    <p style="text-align: center;">
      <a href="${data.trackingUrl}" class="button">Track Your Project</a>
    </p>

    <div class="warning-box">
      <strong>Keep this information safe!</strong><br />
      You'll need your reference code and the last 4 digits of your phone number to access full project details.
    </div>
  `;

  return {
    subject: `Project Submitted: ${data.referenceCode} - Startpoint Academics`,
    html: emailLayout(content),
  };
}
