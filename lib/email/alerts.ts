/**
 * Email Alert System — processes project changes and notifies users.
 *
 * Alert types:
 * - SCORE_DROP: Trust score decreased by 5+ points
 * - STATUS_CHANGE: Project status changed (e.g., UNDER_CONSTRUCTION → LAPSED)
 * - DEADLINE_EXTENSION: Possession date pushed back
 * - NEW_COMPLAINT: New complaint filed against the project
 *
 * Called by the daily cron job at /api/cron/send-alerts
 */

import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "./client";

interface AlertEvent {
  projectId: string;
  projectName: string;
  projectSlug: string;
  stateSlug: string;
  alertType: string;
  description: string;
}

/**
 * Process all pending alerts and send emails to subscribed users.
 */
export async function processAndSendAlerts(): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  // Get all users who have saved projects with alerts enabled
  const savedProjects = await prisma.userSavedProject.findMany({
    where: { alertEnabled: true },
    include: {
      user: { select: { id: true, email: true, name: true } },
      project: {
        select: {
          id: true, name: true, slug: true, trustScore: true, status: true,
          state: { select: { slug: true } },
          timeline: {
            orderBy: { detectedAt: "desc" },
            take: 5,
            where: {
              detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // last 24h
            },
          },
        },
      },
    },
  });

  // Group alerts by user to batch emails
  const userAlerts = new Map<string, { email: string; name: string; events: AlertEvent[] }>();

  for (const saved of savedProjects) {
    if (!saved.user.email) continue;

    const project = saved.project;
    const events: AlertEvent[] = [];

    // Check timeline events from last 24 hours
    for (const event of project.timeline) {
      const alertEvent: AlertEvent = {
        projectId: project.id,
        projectName: project.name,
        projectSlug: project.slug,
        stateSlug: project.state.slug,
        alertType: event.eventType,
        description: event.description ?? `${event.eventType.replace(/_/g, " ")}`,
      };
      events.push(alertEvent);
    }

    if (events.length === 0) continue;

    const key = saved.user.id;
    const existing = userAlerts.get(key);
    if (existing) {
      existing.events.push(...events);
    } else {
      userAlerts.set(key, {
        email: saved.user.email,
        name: saved.user.name ?? "User",
        events,
      });
    }
  }

  // Send batched emails per user
  for (const [, alert] of userAlerts) {
    try {
      const projectRows = alert.events
        .map((e) => {
          const url = `https://rerapedia.com/project/${e.stateSlug}/${e.projectSlug}`;
          return `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                <a href="${url}" style="color: #1e40af; text-decoration: none; font-weight: 600;">${e.projectName}</a>
              </td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                <span style="background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${e.alertType.replace(/_/g, " ")}</span>
              </td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #4b5563;">${e.description}</td>
            </tr>`;
        })
        .join("");

      await sendEmail({
        to: alert.email,
        subject: `ReraPedia Alert: ${alert.events.length} project update${alert.events.length > 1 ? "s" : ""}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 20px;">ReraPedia Project Alerts</h1>
              <p style="margin: 4px 0 0; color: #bfdbfe; font-size: 14px;">Your tracked projects have updates</p>
            </div>
            <div style="padding: 24px 32px;">
              <p style="color: #374151;">Hi ${alert.name},</p>
              <p style="color: #4b5563; font-size: 14px;">The following projects you're tracking have been updated in the last 24 hours:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Project</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Change</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Details</th>
                  </tr>
                </thead>
                <tbody>${projectRows}</tbody>
              </table>
              <a href="https://rerapedia.com/dashboard/saved" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View All Saved Projects</a>
            </div>
            <div style="padding: 16px 32px; background: #f8fafc; border-radius: 0 0 12px 12px; font-size: 12px; color: #9ca3af;">
              <p>You're receiving this because you enabled alerts for these projects on ReraPedia.</p>
              <p>Data sourced from public RERA records. Verify independently before making investment decisions.</p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch (error) {
      console.error(`Failed to send alert to ${alert.email}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

/**
 * Send a single lead notification email to a builder.
 */
export async function sendLeadNotificationEmail(
  builderEmail: string,
  builderName: string,
  leadName: string,
  projectName: string,
  budget: string,
) {
  await sendEmail({
    to: builderEmail,
    subject: `New Lead: ${leadName} interested in ${projectName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; color: white; font-size: 18px;">New Lead Received!</h2>
        </div>
        <div style="padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${builderName},</p>
          <p>A buyer has expressed interest in your project:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Buyer:</strong> ${leadName}</p>
            <p style="margin: 8px 0 0;"><strong>Project:</strong> ${projectName}</p>
            <p style="margin: 8px 0 0;"><strong>Budget:</strong> ${budget}</p>
          </div>
          <a href="https://rerapedia.com/dashboard/builder/leads" style="display: inline-block; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Lead Details</a>
        </div>
      </div>
    `,
  });
}
