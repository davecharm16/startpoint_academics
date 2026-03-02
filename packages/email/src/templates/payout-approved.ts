import { emailLayout } from "./layout";

interface PayoutApprovedData {
  clientName: string;
  amount: number;
  paymentMethod: string;
}

export function payoutApprovedEmail(data: PayoutApprovedData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  return {
    subject: `Your payout of ${formatCurrency(data.amount)} has been processed`,
    html: emailLayout(`
      <h1>Payout Approved!</h1>
      <p>Hi ${data.clientName},</p>
      <p>Your cash payout request has been approved and processed.</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #166534;">Amount Paid</p>
        <p style="font-size: 32px; font-weight: bold; color: #166534;">${formatCurrency(data.amount)}</p>
        <p style="font-size: 14px; color: #166534;">via ${data.paymentMethod === "gcash" ? "GCash" : "Bank Transfer"}</p>
      </div>
      <p>The funds should appear in your account shortly. Thank you for being part of our referral program!</p>
    `),
  };
}
