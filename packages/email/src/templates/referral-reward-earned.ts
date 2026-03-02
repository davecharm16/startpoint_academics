import { emailLayout } from "./layout";

interface ReferralRewardEarnedData {
  referrerName: string;
  rewardAmount: number;
  totalBalance: number;
  dashboardUrl: string;
}

export function referralRewardEarnedEmail(data: ReferralRewardEarnedData) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  return {
    subject: `You earned ${formatCurrency(data.rewardAmount)} from a referral!`,
    html: emailLayout(`
      <h1>Referral Reward Earned!</h1>
      <p>Hi ${data.referrerName},</p>
      <p>Great news! One of your referrals just completed their first project.</p>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #166534; margin: 0;">Reward Earned</p>
        <p style="font-size: 32px; font-weight: bold; color: #166534; margin: 8px 0;">${formatCurrency(data.rewardAmount)}</p>
        <p style="font-size: 14px; color: #166534; margin: 0;">Total Balance: ${formatCurrency(data.totalBalance)}</p>
      </div>
      <p>You can use your balance to get discounts on your own orders or request a cash payout.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.dashboardUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Dashboard</a>
      </div>
      <p>Keep sharing your referral code to earn more rewards!</p>
    `),
  };
}
