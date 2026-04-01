import { sendEmail } from "./client";

export async function sendWelcomeEmail(email: string, name: string, code: string) {
  await sendEmail({
    to: email,
    subject: "Welcome to ReraPedia - Verify Your Email",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Welcome to ReraPedia!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email with the code below:</p>
        <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e40af;">${code}</span>
        </div>
        <p>This code expires in 15 minutes.</p>
        <p style="color: #64748b; font-size: 14px;">If you didn't register on ReraPedia, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendProjectAlertEmail(
  email: string,
  userName: string,
  projectName: string,
  changeDescription: string,
) {
  await sendEmail({
    to: email,
    subject: `ReraPedia Alert: ${projectName} has been updated`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Project Update Alert</h2>
        <p>Hi ${userName},</p>
        <p>A project you're tracking has been updated:</p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${projectName}</strong>
          <p style="margin: 8px 0 0;">${changeDescription}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">You're receiving this because you saved this project on ReraPedia.</p>
      </div>
    `,
  });
}
