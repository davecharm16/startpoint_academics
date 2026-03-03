import { emailLayout } from "./layout";

interface SocialClaimRejectedData {
  clientName: string;
  actionType: string;
  rejectionReason: string;
  dashboardUrl: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  like_page: "Like Our Page",
  follow_page: "Follow Us",
  share_post: "Share a Post",
};

export function socialClaimRejectedEmail(data: SocialClaimRejectedData) {
  const actionLabel =
    ACTION_TYPE_LABELS[data.actionType] || data.actionType;

  return {
    subject: "Social reward claim update",
    html: emailLayout(`
      <h1>Social Claim Update</h1>
      <p>Hi ${data.clientName},</p>
      <p>Your <strong>${actionLabel}</strong> social engagement claim was not approved.</p>
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; color: #991b1b; font-weight: bold;">Reason:</p>
        <p style="font-size: 14px; color: #991b1b;">${data.rejectionReason}</p>
      </div>
      <p>You can resubmit your claim with updated proof. Please make sure your screenshot clearly shows the completed action.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${data.dashboardUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Resubmit Claim</a>
      </div>
    `),
  };
}
