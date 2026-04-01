import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const CreativeSchema = z.object({
  campaignId: z.string().uuid(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  headline: z.string().max(60),
  description: z.string().max(120),
  ctaText: z.string().max(30).optional(),
  destinationUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreativeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    // Verify campaign ownership
    const campaign = await prisma.adCampaign.findFirst({
      where: { id: parsed.data.campaignId, advertiserUserId: user.id },
    });
    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const creative = await prisma.adCreative.create({
      data: {
        campaignId: parsed.data.campaignId,
        imageUrl: parsed.data.imageUrl || null,
        headline: parsed.data.headline,
        description: parsed.data.description,
        ctaText: parsed.data.ctaText ?? "Learn More",
        destinationUrl: parsed.data.destinationUrl,
        isApproved: false,
      },
    });

    // Move campaign to pending approval
    if (campaign.status === "DRAFT") {
      await prisma.adCampaign.update({
        where: { id: campaign.id },
        data: { status: "PENDING_APPROVAL" },
      });
    }

    return NextResponse.json({ success: true, data: { id: creative.id } });
  } catch (error) {
    console.error("Create creative error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
