import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Vercel Cron: Sync PostgreSQL data to Meilisearch indexes daily.
 * Schedule: 0 5 * * * (5:00 AM IST daily)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In production, this would trigger the Meilisearch sync
    // For now, log that the cron ran
    console.log(`[Cron] sync-search triggered at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Search index sync triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] sync-search error:", error);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}
