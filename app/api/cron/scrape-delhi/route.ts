import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Vercel Cron: Trigger Delhi RERA scraper daily.
 * Schedule: 0 4 * * * (4:00 AM IST daily)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[Cron] scrape-delhi triggered at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Delhi scraper triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] scrape-delhi error:", error);
    return NextResponse.json({ success: false, error: "Scraper trigger failed" }, { status: 500 });
  }
}
