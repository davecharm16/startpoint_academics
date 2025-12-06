import { emailLayout } from "./layout";

interface ProjectCompletionData {
  clientName: string;
  referenceCode: string;
  topic: string;
  trackingUrl: string;
}

export function projectCompletionEmail(data: ProjectCompletionData) {
  const content = `
    <h2>Your Project is Complete!</h2>
    <p>Dear ${data.clientName},</p>
    <p>Great news! Your project has been completed and is ready for download.</p>

    <div class="success-box">
      <strong>Project Completed Successfully!</strong><br />
      Your files are now available for download.
    </div>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>Project Details</h2>
    <p><strong>Topic:</strong> ${data.topic}</p>

    <hr />

    <h2>How to Access Your Files</h2>
    <p>1. Click the button below to go to the tracking page</p>
    <p>2. Enter your reference code and PIN (last 4 digits of your phone)</p>
    <p>3. Download your completed files from the "Deliverables" section</p>

    <p style="text-align: center;">
      <a href="${data.trackingUrl}" class="button">Download Your Files</a>
    </p>

    <div class="warning-box">
      <strong>Please Note:</strong><br />
      Files will be available for download for 30 days. Please download and save them to your personal storage.
    </div>

    <hr />

    <p>Thank you for choosing Startpoint Academics! We hope you're satisfied with our service.</p>
    <p>If you have any feedback or need revisions, please contact our support team.</p>
  `;

  return {
    subject: `Project Complete: ${data.referenceCode} - Download Ready!`,
    html: emailLayout(content),
  };
}
