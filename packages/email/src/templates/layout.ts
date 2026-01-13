// Email template layout with consistent branding
export function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Startpoint Academics</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1e3a5f;
      color: #ffffff;
      padding: 24px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header .tagline {
      color: #d4a853;
      font-size: 12px;
      margin-top: 4px;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px;
    }
    .footer {
      background-color: #f4f4f5;
      padding: 24px 32px;
      text-align: center;
      color: #71717a;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      background-color: #d4a853;
      color: #1e3a5f;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #c49943;
    }
    .info-box {
      background-color: #f4f4f5;
      border-left: 4px solid #d4a853;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    .success-box {
      background-color: #dcfce7;
      border-left: 4px solid #22c55e;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    .error-box {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
    h2 {
      color: #1e3a5f;
      margin-top: 0;
    }
    p {
      color: #3f3f46;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .label {
      color: #71717a;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .value {
      color: #1e3a5f;
      font-weight: 600;
      font-size: 16px;
    }
    .mono {
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      background-color: #f4f4f5;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 14px;
    }
    hr {
      border: none;
      border-top: 1px solid #e4e4e7;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Startpoint Academics</h1>
        <div class="tagline">EXCELLENCE IN ACADEMIC ASSISTANCE</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>This email was sent by Startpoint Academics.</p>
        <p>If you have questions, please contact us at support@startpointacademics.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
