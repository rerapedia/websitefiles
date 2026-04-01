/**
 * ReraPedia Email Templates — Beautiful branded HTML emails via Gmail SMTP.
 * All emails use a consistent design: gradient header, clean body, dark footer.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com";
const LOGO_URL = `${SITE_URL}/logo.svg`;

function baseTemplate(title: string, content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0E4A8A 0%,#1A6BC4 40%,#378ADD 100%);padding:28px 32px;text-align:left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">RERA</span><span style="font-size:24px;font-weight:400;color:#8EC5F0;letter-spacing:-0.5px;">pedia</span>
                    <p style="margin:4px 0 0;font-size:10px;color:#85B7EB;letter-spacing:3px;text-transform:uppercase;">India's RERA Directory</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0c1222;padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#6b7280;">
                      You're receiving this from <a href="${SITE_URL}" style="color:#378ADD;text-decoration:none;">ReraPedia</a> — India's RERA Transparency Platform.
                    </p>
                    <p style="margin:8px 0 0;font-size:11px;color:#4b5563;">
                      Data sourced from public RERA records. Verify independently before making investment decisions.
                    </p>
                    <p style="margin:12px 0 0;font-size:11px;color:#4b5563;">
                      © 2026 ReraPedia. All rights reserved.
                      <br />
                      <a href="${SITE_URL}/privacy-policy" style="color:#6b7280;text-decoration:underline;">Privacy Policy</a> ·
                      <a href="${SITE_URL}/terms" style="color:#6b7280;text-decoration:underline;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:linear-gradient(135deg,#0E4A8A,#378ADD);border-radius:10px;padding:12px 28px;">
        <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function infoBox(items: Array<[string, string]>): string {
  const rows = items.map(([label, value]) =>
    `<tr><td style="padding:6px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;">${label}</td><td style="padding:6px 12px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9;">${value}</td></tr>`
  ).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin:16px 0;overflow:hidden;">${rows}</table>`;
}

// ============================================================
// INDIVIDUAL TEMPLATES
// ============================================================

export function welcomeEmailHtml(name: string): string {
  return baseTemplate("Welcome to ReraPedia!", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Welcome to ReraPedia, ${name}! 🏠</h1>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;">Thank you for joining India's most trusted RERA transparency platform. Here's what you can do:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${["🔍 Search 3,200+ RERA projects across 5 states", "📊 Check Trust Scores for any project or builder", "🔔 Save projects and get instant change alerts", "📥 Download branded PDF reports"].map(item =>
        `<tr><td style="padding:8px 0;font-size:14px;color:#374151;">${item}</td></tr>`
      ).join("")}
    </table>
    ${button("Start Exploring Projects", `${SITE_URL}/search`)}
    <p style="color:#9ca3af;font-size:12px;">Need help? Reply to this email — we read every message.</p>
  `, "Welcome! Start exploring 3,200+ RERA projects.");
}

export function verificationOtpHtml(name: string, code: string): string {
  return baseTemplate("Verify Your Email", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Verify Your Email</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, use this code to verify your email address:</p>
    <div style="background:#f0f4ff;padding:24px;text-align:center;border-radius:12px;margin:24px 0;">
      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0E4A8A;">${code}</span>
    </div>
    <p style="color:#9ca3af;font-size:13px;">This code expires in 15 minutes. If you didn't register on ReraPedia, ignore this email.</p>
  `, `Your verification code is ${code}`);
}

export function passwordResetHtml(name: string, resetLink: string): string {
  return baseTemplate("Reset Your Password", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Reset Your Password</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, click below to reset your password:</p>
    ${button("Reset Password", resetLink)}
    <p style="color:#9ca3af;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `);
}

export function leadNotificationHtml(builderName: string, buyerName: string, projectName: string, budget: string, phone: string): string {
  return baseTemplate("New Lead Received!", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">🎯 New Lead Received!</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${builderName}, a buyer has expressed interest in your project:</p>
    ${infoBox([
      ["Buyer Name", buyerName],
      ["Phone", phone],
      ["Project", projectName],
      ["Budget", budget],
    ])}
    ${button("View Lead Details", `${SITE_URL}/dashboard/builder/leads`)}
    <p style="color:#9ca3af;font-size:12px;">Tip: Responding within 1 hour increases conversion by 7x.</p>
  `, `New lead from ${buyerName} for ${projectName}`);
}

export function leadPurchasedHtml(brokerName: string, buyerName: string, buyerPhone: string, buyerEmail: string, projectName: string): string {
  return baseTemplate("Lead Purchase Confirmed", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">✅ Lead Purchase Confirmed</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${brokerName}, here are the buyer details:</p>
    ${infoBox([
      ["Buyer Name", buyerName],
      ["Phone", `<a href="tel:${buyerPhone}" style="color:#0E4A8A;text-decoration:none;font-weight:700;">${buyerPhone}</a>`],
      ["Email", buyerEmail || "Not provided"],
      ["Project", projectName],
    ])}
    ${button("View All Purchased Leads", `${SITE_URL}/dashboard/broker/purchased`)}
    <p style="color:#9ca3af;font-size:12px;">Contact the buyer promptly for best results.</p>
  `, `Lead purchased: ${buyerName} — ${buyerPhone}`);
}

export function projectAlertHtml(userName: string, changes: Array<{ project: string; change: string; url: string }>): string {
  const rows = changes.map(c =>
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
        <a href="${c.url}" style="color:#0E4A8A;text-decoration:none;font-weight:600;font-size:14px;">${c.project}</a>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
        <span style="background:#eff6ff;color:#0E4A8A;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;">${c.change}</span>
      </td>
    </tr>`
  ).join("");

  return baseTemplate("Project Alerts", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">🔔 Project Updates</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${userName}, your tracked projects have updates:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr style="background:#f8fafc;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Project</th>
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Change</th>
      </tr>
      ${rows}
    </table>
    ${button("View All Saved Projects", `${SITE_URL}/dashboard/saved`)}
  `, `${changes.length} project update${changes.length > 1 ? "s" : ""} for you`);
}

export function subscriptionConfirmedHtml(name: string, planName: string, amount: string): string {
  return baseTemplate("Subscription Confirmed!", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">🎉 Subscription Activated!</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, your subscription is now active:</p>
    <div style="background:linear-gradient(135deg,#0E4A8A,#378ADD);border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${planName}</p>
      <p style="margin:6px 0 0;font-size:16px;color:#8EC5F0;">${amount}/month</p>
    </div>
    ${button("Go to Dashboard", `${SITE_URL}/dashboard/builder`)}
  `, `Your ${planName} plan is now active!`);
}

export function subscriptionExpiryHtml(name: string, planName: string, expiryDate: string): string {
  return baseTemplate("Subscription Expiring Soon", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">⏰ Subscription Expiring</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, your <strong>${planName}</strong> subscription expires on <strong>${expiryDate}</strong>.</p>
    <p style="color:#4b5563;font-size:15px;">Renew now to keep access to leads, analytics, and advertising features.</p>
    ${button("Renew Now", `${SITE_URL}/pricing`)}
  `, `Your ${planName} subscription expires on ${expiryDate}`);
}

export function weeklyDigestHtml(name: string, stats: { projects: number; newLeads: number; scoreChanges: number }): string {
  return baseTemplate("Weekly Digest", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">📊 Your Weekly Digest</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, here's your weekly summary:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:10px 0 0 10px;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#0E4A8A;">${stats.projects}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#6b7280;">Projects Tracked</p>
        </td>
        <td style="text-align:center;padding:16px;background:#f8fafc;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#0E4A8A;">${stats.newLeads}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#6b7280;">New Leads</p>
        </td>
        <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:0 10px 10px 0;">
          <p style="margin:0;font-size:28px;font-weight:700;color:#0E4A8A;">${stats.scoreChanges}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#6b7280;">Score Changes</p>
        </td>
      </tr>
    </table>
    ${button("View Dashboard", `${SITE_URL}/dashboard/saved`)}
  `, `${stats.projects} projects tracked, ${stats.newLeads} new leads this week`);
}

export function leadMagnetHtml(name: string): string {
  return baseTemplate("Your Free RERA Checklist", `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">📋 Your RERA Buyer's Checklist</h1>
    <p style="color:#4b5563;font-size:15px;">Hi ${name}, thank you for downloading our checklist! Here are the 15 things every buyer must verify:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${[
        "✅ Verify RERA registration number",
        "✅ Check builder's Trust Score on ReraPedia",
        "✅ Verify possession date is realistic",
        "✅ Check builder's delivery record on past projects",
        "✅ Read the RERA agreement carefully",
        "✅ Verify carpet area matches advertisements",
        "✅ Check complaint history",
        "✅ Verify builder's escrow account",
        "✅ Check QPR submissions",
        "✅ Verify land title and approvals",
        "✅ Check construction progress vs timeline",
        "✅ Compare with similar projects nearby",
        "✅ Check for NCLT/insolvency proceedings",
        "✅ Verify environmental clearances",
        "✅ Get lawyer to review agreement before signing",
      ].map(item => `<tr><td style="padding:4px 0;font-size:13px;color:#374151;">${item}</td></tr>`).join("")}
    </table>
    ${button("Search RERA Projects Now", `${SITE_URL}/search`)}
    <p style="color:#9ca3af;font-size:12px;">Read our full guide: <a href="${SITE_URL}/blog/safe-to-buy-under-construction-property-rera-checklist" style="color:#0E4A8A;">Is It Safe to Buy Under Construction Property?</a></p>
  `, "Your free 15-point RERA checklist is here!");
}

/**
 * Campaign email — generic template for marketing campaigns.
 */
export function campaignEmailHtml(subject: string, bodyHtml: string): string {
  return baseTemplate(subject, bodyHtml);
}
