import { emailLayout } from "./layout";
import { format } from "date-fns";

interface ProjectSummary {
  referenceCode: string;
  topic: string;
  clientName: string;
  status: string;
}

interface DeadlineItem {
  referenceCode: string;
  topic: string;
  writerName: string;
  deadline: Date;
  hoursRemaining: number;
}

interface AdminDigestData {
  adminName: string;
  date: Date;
  stats: {
    newSubmissions: number;
    pendingValidation: number;
    inProgress: number;
    completedToday: number;
    totalRevenue: number;
  };
  upcomingDeadlines: DeadlineItem[];
  recentSubmissions: ProjectSummary[];
  pendingPayments: ProjectSummary[];
  dashboardUrl: string;
}

export function adminDailyDigestEmail(data: AdminDigestData) {
  const formattedDate = format(data.date, "EEEE, MMMM d, yyyy");
  const formattedRevenue = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(data.stats.totalRevenue);

  const deadlinesHtml = data.upcomingDeadlines.length > 0
    ? data.upcomingDeadlines.map(d => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">
            <span class="mono">${d.referenceCode}</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${d.writerName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: right;">
            <span style="color: ${d.hoursRemaining <= 12 ? '#ef4444' : d.hoursRemaining <= 24 ? '#f59e0b' : '#22c55e'}; font-weight: 600;">
              ${d.hoursRemaining}h
            </span>
          </td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #71717a;">No upcoming deadlines in the next 48 hours</td></tr>`;

  const recentSubmissionsHtml = data.recentSubmissions.length > 0
    ? data.recentSubmissions.map(p => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">
            <span class="mono">${p.referenceCode}</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${p.clientName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${p.status}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #71717a;">No new submissions today</td></tr>`;

  const pendingPaymentsHtml = data.pendingPayments.length > 0
    ? data.pendingPayments.map(p => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">
            <span class="mono">${p.referenceCode}</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${p.clientName}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="2" style="padding: 16px; text-align: center; color: #71717a;">No pending payment validations</td></tr>`;

  const content = `
    <h2>Daily Operations Digest</h2>
    <p>Good morning, ${data.adminName}!</p>
    <p>Here's your daily summary for ${formattedDate}:</p>

    <hr />

    <h2>Quick Stats</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; background-color: #dbeafe; border-radius: 4px; text-align: center; width: 25%;">
          <div style="font-size: 24px; font-weight: bold; color: #1e3a5f;">${data.stats.newSubmissions}</div>
          <div style="font-size: 12px; color: #64748b;">New Today</div>
        </td>
        <td style="padding: 12px; background-color: #fef3c7; border-radius: 4px; text-align: center; width: 25%;">
          <div style="font-size: 24px; font-weight: bold; color: #1e3a5f;">${data.stats.pendingValidation}</div>
          <div style="font-size: 12px; color: #64748b;">Pending Validation</div>
        </td>
        <td style="padding: 12px; background-color: #e0e7ff; border-radius: 4px; text-align: center; width: 25%;">
          <div style="font-size: 24px; font-weight: bold; color: #1e3a5f;">${data.stats.inProgress}</div>
          <div style="font-size: 12px; color: #64748b;">In Progress</div>
        </td>
        <td style="padding: 12px; background-color: #dcfce7; border-radius: 4px; text-align: center; width: 25%;">
          <div style="font-size: 24px; font-weight: bold; color: #1e3a5f;">${data.stats.completedToday}</div>
          <div style="font-size: 12px; color: #64748b;">Completed</div>
        </td>
      </tr>
    </table>

    <div class="info-box" style="margin-top: 16px;">
      <div class="label">Today's Revenue (Admin Share)</div>
      <div class="value">${formattedRevenue}</div>
    </div>

    <hr />

    <h2>Upcoming Deadlines (48h)</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f4f4f5;">
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Reference</th>
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Writer</th>
          <th style="padding: 8px; text-align: right; font-size: 12px; color: #71717a;">Time Left</th>
        </tr>
      </thead>
      <tbody>
        ${deadlinesHtml}
      </tbody>
    </table>

    <hr />

    <h2>Recent Submissions</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f4f4f5;">
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Reference</th>
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Client</th>
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${recentSubmissionsHtml}
      </tbody>
    </table>

    <hr />

    <h2>Pending Payment Validations</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f4f4f5;">
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Reference</th>
          <th style="padding: 8px; text-align: left; font-size: 12px; color: #71717a;">Client</th>
        </tr>
      </thead>
      <tbody>
        ${pendingPaymentsHtml}
      </tbody>
    </table>

    <p style="text-align: center; margin-top: 24px;">
      <a href="${data.dashboardUrl}" class="button">Open Dashboard</a>
    </p>
  `;

  return {
    subject: `Daily Digest: ${format(data.date, "MMM d")} - ${data.stats.newSubmissions} new, ${data.stats.pendingValidation} pending`,
    html: emailLayout(content),
  };
}
