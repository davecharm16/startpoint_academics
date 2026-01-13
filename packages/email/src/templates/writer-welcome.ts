import { emailLayout } from "./layout";

interface WriterWelcomeEmailProps {
  writerName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export function writerWelcomeEmail({
  writerName,
  email,
  tempPassword,
  loginUrl,
}: WriterWelcomeEmailProps): { subject: string; html: string } {
  const content = `
    <h2>Welcome to the Team, ${writerName}!</h2>

    <p>You've been added as a writer to Startpoint Academics. We're excited to have you on board!</p>

    <p>Here are your login credentials:</p>

    <div class="info-box">
      <div class="label">Email</div>
      <div class="value">${email}</div>
      <br/>
      <div class="label">Temporary Password</div>
      <div class="value mono" style="font-size: 18px; letter-spacing: 1px;">${tempPassword}</div>
    </div>

    <div class="warning-box">
      <strong>Important:</strong> You will be required to change your password on your first login for security purposes.
    </div>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Login to Your Dashboard</a>
    </p>

    <hr/>

    <h3 style="color: #1e3a5f;">Getting Started</h3>
    <p>Once logged in, you'll be able to:</p>
    <ul style="color: #3f3f46; line-height: 1.8;">
      <li>View projects assigned to you</li>
      <li>Access complete client briefs</li>
      <li>Update project status as you work</li>
      <li>Track your earnings</li>
    </ul>

    <p>If you have any questions, feel free to reach out to the admin team.</p>

    <p>Welcome aboard!</p>
  `;

  return {
    subject: "Welcome to Startpoint Academics - Your Writer Account",
    html: emailLayout(content),
  };
}
