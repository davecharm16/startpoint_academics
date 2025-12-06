import { emailLayout } from "./layout";

interface PaymentRejectedData {
  clientName: string;
  referenceCode: string;
  rejectionReason: string;
  trackingUrl: string;
}

export function paymentRejectedEmail(data: PaymentRejectedData) {
  const content = `
    <h2>Payment Verification Issue</h2>
    <p>Dear ${data.clientName},</p>
    <p>We were unable to verify your payment proof for the following project:</p>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <div class="error-box">
      <strong>Reason:</strong><br />
      ${data.rejectionReason}
    </div>

    <hr />

    <h2>What You Need to Do</h2>
    <p>Please submit a new payment proof with the following requirements:</p>
    <ul>
      <li>Clear, readable screenshot or photo of the transaction</li>
      <li>Transaction reference number must be visible</li>
      <li>Amount and date must be clearly shown</li>
      <li>Ensure the payment matches the agreed amount</li>
    </ul>

    <p style="text-align: center;">
      <a href="${data.trackingUrl}" class="button">View Project Details</a>
    </p>

    <p>If you have questions or need assistance, please don't hesitate to contact our support team.</p>
  `;

  return {
    subject: `Action Required: Payment Issue - ${data.referenceCode}`,
    html: emailLayout(content),
  };
}
