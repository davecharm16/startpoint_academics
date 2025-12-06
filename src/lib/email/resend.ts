import { Resend } from "resend";

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Default sender
const FROM_EMAIL = process.env.EMAIL_FROM || "Startpoint Academics <noreply@startpointacademics.com>";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, text, replyTo }: EmailOptions) {
  const resend = getResendClient();

  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html),
      replyTo,
    });

    if (error) {
      console.error("[Email] Send error:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return { success: false, error: "Failed to send email" };
  }
}

// Helper to strip HTML for plain text version
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Batch send utility for multiple recipients with same template
export async function sendBatchEmails(
  recipients: { email: string; data: Record<string, string> }[],
  templateFn: (data: Record<string, string>) => { subject: string; html: string }
) {
  const results = await Promise.all(
    recipients.map(async ({ email, data }) => {
      const { subject, html } = templateFn(data);
      return {
        email,
        ...(await sendEmail({ to: email, subject, html })),
      };
    })
  );

  return results;
}
