const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null; // Email disabled — skip silently

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendReviewCompleteEmail = async (toEmail, review) => {
  const transport = getTransporter();
  if (!transport || !toEmail) return; // Not configured or no target email — skip silently

  const errorCount = review.findings?.filter(f => f.severity === 'error').length || 0;
  const warningCount = review.findings?.filter(f => f.severity === 'warning').length || 0;
  const score = review.overallScore ?? 'N/A';

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background:#6366f1;padding:24px;text-align:center;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;font-weight:800;">AI Code Review Complete</h2>
      </div>
      <div style="padding:24px;background:#ffffff;">
        <p style="margin-top:0;font-size:14px;line-height:1.6;color:#334155;">Hello,</p>
        <p style="font-size:14px;line-height:1.6;color:#334155;">Your requested source code analysis has completed. Here is a summary of the quality metrics:</p>
        
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:13px;">
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 0;color:#64748b;font-weight:600;">Overall Quality Score</td>
            <td style="padding:10px 0;text-align:right;font-weight:800;color:#6366f1;font-size:15px;">${score} / 100</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 0;color:#64748b;font-weight:600;">Errors Found</td>
            <td style="padding:10px 0;text-align:right;font-weight:700;color:#ef4444;">${errorCount}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 0;color:#64748b;font-weight:600;">Warnings Flagged</td>
            <td style="padding:10px 0;text-align:right;font-weight:700;color:#f59e0b;">${warningCount}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;font-weight:600;">Language detected</td>
            <td style="padding:10px 0;text-align:right;font-weight:700;color:#0f172a;text-transform:capitalize;">${review.language || 'Unknown'}</td>
          </tr>
        </table>
        
        <p style="font-size:14px;line-height:1.6;color:#334155;margin-bottom:0;">
          Log in to your dashboard to inspect full code line annotations, cyclomatic complexities, and automated AI refactoring recommendations.
        </p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;color:#94a3b8;">&copy; 2026 AI Code Review Assistant. All rights reserved.</p>
      </div>
    </div>
  `;

  await transport.sendMail({
    from: process.env.SMTP_FROM || '"AI Code Review" <noreply@aicra.dev>',
    to: toEmail,
    subject: `Your Code Review is Ready — Score: ${score}/100`,
    html,
  });
};

module.exports = { sendReviewCompleteEmail };
