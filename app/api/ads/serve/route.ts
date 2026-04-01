import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { AdType } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const adType = params.get("type") ?? "BANNER_728x90";
    const state = params.get("state");
    const city = params.get("city");

    // Find active campaigns with approved creatives matching the ad type
    const campaigns = await prisma.adCampaign.findMany({
      where: {
        status: "ACTIVE",
        adType: adType as AdType,
        deletedAt: null,
      },
      include: {
        creatives: { where: { isApproved: true }, take: 1 },
      },
      orderBy: { cpcBidPaise: "desc" }, // Highest bid first
      take: 5,
    });

    // Filter by geo targeting
    const matching = campaigns.filter((c) => {
      if (!c.creatives.length) return false;
      const targetStates = c.targetStates as string[] | null;
      const targetCities = c.targetCities as string[] | null;
      if (state && targetStates?.length && !targetStates.includes(state)) return false;
      if (city && targetCities?.length && !targetCities.includes(city)) return false;
      return true;
    });

    if (matching.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    // Pick the highest-bidding campaign
    const winner = matching[0];
    const creative = winner.creatives[0];

    // Track impression server-side (CLAUDE.md: server-side only for fraud prevention)
    const impression = await prisma.adImpression.create({
      data: {
        campaignId: winner.id,
        creativeId: creative.id,
        pageUrl: params.get("page") ?? "",
        ipAddress: request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        impressionId: impression.id,
        headline: creative.headline,
        description: creative.description,
        imageUrl: creative.imageUrl,
        ctaText: creative.ctaText,
        destinationUrl: creative.destinationUrl,
        clickUrl: `/api/ads/click?id=${impression.id}`,
      },
    });
  } catch (error) {
    console.error("Ad serve error:", error);
    return NextResponse.json({ success: true, data: null });
  }
}
