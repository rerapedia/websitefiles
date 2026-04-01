import { NextRequest, NextResponse } from "next/server";
import { processAndSendAlerts } from "@/lib/email/alerts";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Vercel Cron: Send daily email alerts for project changes.
 * Schedule: 0 8 * * * (8:00 AM IST daily)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[Cron] send-alerts triggered at ${new Date().toISOString()}`);

    const result = await processAndSendAlerts();

    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} alert emails, ${result.errors} errors`,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] send-alerts error:", error);
    return NextResponse.json({ success: false, error: "Alert processing failed" }, { status: 500 });
  }
}
