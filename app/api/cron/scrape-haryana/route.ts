import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Vercel Cron: Trigger Haryana RERA scraper daily.
 * Schedule: 0 3 * * * (3:00 AM IST daily)
 * In production, this calls the Railway-hosted scraper service.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(`[Cron] scrape-haryana triggered at ${new Date().toISOString()}`);

    // In production: call Railway scraper service
    // const scraperUrl = process.env.SCRAPER_SERVICE_URL;
    // await fetch(`${scraperUrl}/run/haryana`, { method: "POST" });

    return NextResponse.json({
      success: true,
      message: "Haryana scraper triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] scrape-haryana error:", error);
    return NextResponse.json({ success: false, error: "Scraper trigger failed" }, { status: 500 });
  }
}
