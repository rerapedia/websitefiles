import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const impressionId = request.nextUrl.searchParams.get("id");
    if (!impressionId) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const impression = await prisma.adImpression.findUnique({
      where: { id: impressionId },
      include: {
        creative: { select: { destinationUrl: true } },
        campaign: { select: { id: true, cpcBidPaise: true, spentPaise: true } },
      },
    });

    if (!impression) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Dedup: one click per impression (server-side fraud prevention)
    const existingClick = await prisma.adClick.findFirst({
      where: { impressionId },
    });

    if (!existingClick) {
      // Record click
      await prisma.adClick.create({
        data: {
          impressionId,
          campaignId: impression.campaignId,
          creativeId: impression.creativeId,
          ipAddress: request.headers.get("x-forwarded-for") ?? "",
        },
      });

      // Update campaign spend
      const cpcBid = impression.campaign.cpcBidPaise ?? 0;
      await prisma.adCampaign.update({
        where: { id: impression.campaignId },
        data: { spentPaise: { increment: cpcBid } },
      });
    }

    // Redirect to advertiser's destination URL
    return NextResponse.redirect(impression.creative.destinationUrl);
  } catch (error) {
    console.error("Ad click error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
