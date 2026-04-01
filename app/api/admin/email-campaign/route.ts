import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { sendBulkEmails } from "@/lib/email/client";
import { campaignEmailHtml } from "@/lib/email/templates";
import { z } from "zod";

const CampaignSchema = z.object({
  subject: z.string().min(3).max(200),
  bodyHtml: z.string().min(10),
  audience: z.enum(["ALL_LEADS", "ALL_USERS", "BUYERS", "BUILDERS", "BROKERS", "SUBSCRIBERS"]),
  testEmail: z.string().email().optional(),
  sendTest: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { subject, bodyHtml, audience, testEmail, sendTest } = parsed.data;
    const html = campaignEmailHtml(subject, bodyHtml);

    // Test mode: send to single email
    if (sendTest && testEmail) {
      const { sendEmail } = await import("@/lib/email/client");
      await sendEmail({ to: testEmail, subject: `[TEST] ${subject}`, html });
      return NextResponse.json({ success: true, data: { mode: "test", sentTo: testEmail } });
    }

    // Build recipient list based on audience
    let recipients: Array<{ email: string; name?: string }> = [];

    if (audience === "ALL_LEADS") {
      const leads = await prisma.lead.findMany({
        where: { buyerEmail: { not: null } },
        select: { buyerEmail: true, buyerName: true },
        distinct: ["buyerEmail"],
      });
      recipients = leads.filter((l) => l.buyerEmail).map((l) => ({
        email: l.buyerEmail!,
        name: l.buyerName,
      }));
    } else if (audience === "ALL_USERS") {
      const users = await prisma.user.findMany({
        where: { email: { not: null }, deletedAt: null },
        select: { email: true, name: true },
      });
      recipients = users.filter((u) => u.email).map((u) => ({
        email: u.email!,
        name: u.name ?? undefined,
      }));
    } else if (audience === "BUYERS") {
      const users = await prisma.user.findMany({
        where: { role: "BUYER", email: { not: null }, deletedAt: null },
        select: { email: true, name: true },
      });
      recipients = users.filter((u) => u.email).map((u) => ({ email: u.email!, name: u.name ?? undefined }));
    } else if (audience === "BUILDERS") {
      const users = await prisma.user.findMany({
        where: { role: "BUILDER", email: { not: null }, deletedAt: null },
        select: { email: true, name: true },
      });
      recipients = users.filter((u) => u.email).map((u) => ({ email: u.email!, name: u.name ?? undefined }));
    } else if (audience === "BROKERS") {
      const users = await prisma.user.findMany({
        where: { role: "BROKER", email: { not: null }, deletedAt: null },
        select: { email: true, name: true },
      });
      recipients = users.filter((u) => u.email).map((u) => ({ email: u.email!, name: u.name ?? undefined }));
    } else if (audience === "SUBSCRIBERS") {
      const subs = await prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        include: { user: { select: { email: true, name: true } } },
      });
      recipients = subs.filter((s) => s.user.email).map((s) => ({
        email: s.user.email!,
        name: s.user.name ?? undefined,
      }));
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: "No recipients found for this audience" }, { status: 400 });
    }

    const result = await sendBulkEmails({ recipients, subject, html });

    return NextResponse.json({
      success: true,
      data: {
        mode: "campaign",
        audience,
        totalRecipients: recipients.length,
        sent: result.sent,
        failed: result.failed,
      },
    });
  } catch (error) {
    console.error("Campaign error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// GET: Return audience counts for preview
export async function GET() {
  try {
    const [leadCount, userCount, buyerCount, builderCount, brokerCount, subscriberCount] = await Promise.all([
      prisma.lead.count({ where: { buyerEmail: { not: null } } }),
      prisma.user.count({ where: { email: { not: null }, deletedAt: null } }),
      prisma.user.count({ where: { role: "BUYER", email: { not: null }, deletedAt: null } }),
      prisma.user.count({ where: { role: "BUILDER", email: { not: null }, deletedAt: null } }),
      prisma.user.count({ where: { role: "BROKER", email: { not: null }, deletedAt: null } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ALL_LEADS: leadCount,
        ALL_USERS: userCount,
        BUYERS: buyerCount,
        BUILDERS: builderCount,
        BROKERS: brokerCount,
        SUBSCRIBERS: subscriberCount,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
