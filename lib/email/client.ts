import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
});

const FROM_NAME = process.env.SMTP_FROM_NAME ?? "ReraPedia";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL ?? "rerapedia@gmail.com";

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const recipients = Array.isArray(to) ? to : [to];

  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL DEV] To: ${recipients.join(", ")}\nSubject: ${subject}\n`);
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: recipients.join(", "),
      subject,
      html,
      replyTo: replyTo ?? FROM_EMAIL,
    });

    console.log(`[EMAIL] Sent to ${recipients.join(", ")} — Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send to ${recipients.join(", ")}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send bulk emails (for campaigns) — sends individually to avoid CC exposure.
 */
export async function sendBulkEmails({
  recipients,
  subject,
  html,
}: {
  recipients: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
}): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Personalize the email if name is available
    const personalizedHtml = html.replace(/\{\{name\}\}/g, recipient.name ?? "there");

    try {
      await sendEmail({
        to: recipient.email,
        subject,
        html: personalizedHtml,
      });
      sent++;

      // Rate limit: max 10 emails per second (Gmail limit ~500/day)
      if (sent % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}
