import { emailLayout } from "./layout";

interface PaymentValidatedData {
  clientName: string;
  referenceCode: string;
  amountValidated: number;
  trackingUrl: string;
}

export function paymentValidatedEmail(data: PaymentValidatedData) {
  const formattedAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(data.amountValidated);

  const content = `
    <h2>Payment Validated!</h2>
    <p>Dear ${data.clientName},</p>
    <p>Great news! Your payment has been validated and your project is now being processed.</p>

    <div class="success-box">
      <div class="label">Payment Confirmed</div>
      <div class="value">${formattedAmount}</div>
    </div>

    <div class="info-box">
      <div class="label">Reference Code</div>
      <div class="value mono">${data.referenceCode}</div>
    </div>

    <hr />

    <h2>What's Next?</h2>
    <p>A writer will be assigned to your project shortly. You'll receive a notification once the assignment is made and work begins.</p>

    <p style="text-align: center;">
      <a href="${data.trackingUrl}" class="button">Track Your Project</a>
    </p>

    <p>Thank you for choosing Startpoint Academics!</p>
  `;

  return {
    subject: `Payment Confirmed: ${data.referenceCode} - Startpoint Academics`,
    html: emailLayout(content),
  };
}
