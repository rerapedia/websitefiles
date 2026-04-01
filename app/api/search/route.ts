import { NextRequest, NextResponse } from "next/server";
import { meilisearch, INDEXES } from "@/lib/search/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const state = searchParams.get("state");
  const status = searchParams.get("status");
  const scoreMin = searchParams.get("scoreMin");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "60", 10);

  // Cap limit at 200 to prevent abuse
  const safeLimit = Math.min(limit, 200);
  const offset = (page - 1) * safeLimit;

  const filters: string[] = [];
  if (state) filters.push(`stateSlug = "${state}"`);
  if (status) filters.push(`status = "${status}"`);
  if (scoreMin) filters.push(`trustScore >= ${scoreMin}`);

  try {
    const results = await meilisearch.index(INDEXES.PROJECTS).search(q, {
      filter: filters.length > 0 ? filters.join(" AND ") : undefined,
      limit: safeLimit,
      offset,
      attributesToHighlight: ["name", "city", "locality", "builderName"],
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Meilisearch error:", error);
    return NextResponse.json({
      success: true,
      data: { hits: [], estimatedTotalHits: 0 },
    });
  }
}
