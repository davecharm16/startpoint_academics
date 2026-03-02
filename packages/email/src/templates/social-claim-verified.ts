import { emailLayout } from "./layout";

interface SocialClaimVerifiedData {
  clientName: string;
  actionType: string;
  discountAmount: number;
  totalBalance: number;
  dashboardUrl: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  like_page: "Like Our Page",
  follow_page: "Follow Us",
  share_post: "Share a Post",
};

export function socialClaimVerifiedEmail(data: SocialClaimVerifiedData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  const actionLabel =
    ACTION_TYPE_LABELS[data.actionType] || data.actionType;

  return {
    subject: `You earned ${formatCurrency(data.discountAmount)} from social engagement!`,
    html: emailLayout(`
      <h1>Social Reward Verified!</h1>
      <p>Hi ${data.clientName},</p>
      <p>Great news! Your <strong>${actionLabel}</strong> social engagement has been verified.</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #166534; margin: 0;">Reward Earned</p>
        <p style="font-size: 32px; font-weight: bold; color: #166534; margin: 8px 0;">${formatCurrency(data.discountAmount)}</p>
        <p style="font-size: 14px; color: #166534; margin: 0;">Total Balance: ${formatCurrency(data.totalBalance)}</p>
      </div>
      <p>You can use your balance to get discounts on your next order or request a cash payout.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.dashboardUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Dashboard</a>
      </div>
      <p>Thank you for engaging with us on social media!</p>
    `),
  };
}
