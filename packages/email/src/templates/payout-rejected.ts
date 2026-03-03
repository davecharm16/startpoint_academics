import { emailLayout } from "./layout";

interface PayoutRejectedData {
  clientName: string;
  amount: number;
  reason: string;
}

export function payoutRejectedEmail(data: PayoutRejectedData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  return {
    subject: "Payout request update",
    html: emailLayout(`
      <h1>Payout Request Update</h1>
      <p>Hi ${data.clientName},</p>
      <p>Your cash payout request for ${formatCurrency(data.amount)} was not approved.</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; color: #991b1b; font-weight: bold;">Reason:</p>
        <p style="font-size: 14px; color: #991b1b;">${data.reason}</p>
      </div>
      <p>The amount of ${formatCurrency(data.amount)} has been restored to your reward balance. You can submit a new request or use your balance for order discounts.</p>
    `),
  };
}
