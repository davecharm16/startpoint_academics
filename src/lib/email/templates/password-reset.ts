interface PasswordResetEmailProps {
  writerName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export function passwordResetEmail({
  writerName,
  email,
  tempPassword,
  loginUrl,
}: PasswordResetEmailProps) {
  return {
    subject: "Your Password Has Been Reset - Startpoint Academics",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: #d4af37; margin: 0; font-size: 24px;">Startpoint Academics</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1e3a5f; margin-top: 0;">Password Reset</h2>

    <p>Hello ${writerName},</p>

    <p>Your password has been reset by an administrator. Please use the temporary credentials below to log in:</p>

    <div style="background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0; font-size: 18px;">
        <strong>Temporary Password:</strong>
        <code style="background: #1e3a5f; color: #d4af37; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>
      </p>
    </div>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;">
        <strong>Important:</strong> You will be required to change this password immediately after logging in.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background: #1e3a5f; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Log In Now</a>
    </div>

    <p style="color: #666; font-size: 14px;">
      If you did not expect this password reset, please contact your administrator immediately.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      This is an automated message from Startpoint Academics.<br>
      Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `.trim(),
  };
}
