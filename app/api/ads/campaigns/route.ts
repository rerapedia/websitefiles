import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const CampaignSchema = z.object({
  campaignName: z.string().min(3).max(200),
  adType: z.enum(["BANNER_728x90", "SIDEBAR_300x250", "IN_CONTENT_NATIVE", "SEARCH_SPONSORED"]),
  budgetTotalPaise: z.number().min(100000), // Min ₹1,000
  budgetDailyPaise: z.number().min(10000).optional(), // Min ₹100/day
  cpcBidPaise: z.number().min(500).optional(), // Min ₹5 per click
  targetStates: z.array(z.string()).optional(),
  targetCities: z.array(z.string()).optional(),
  targetLocalities: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await prisma.adCampaign.findMany({
      where: { advertiserUserId: user.id, deletedAt: null },
      include: {
        creatives: { take: 1 },
        _count: { select: { impressions: true, clicks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { campaigns } });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        { status: 400 },
      );
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        advertiserUserId: user.id,
        campaignName: parsed.data.campaignName,
        adType: parsed.data.adType,
        budgetTotalPaise: parsed.data.budgetTotalPaise,
        budgetDailyPaise: parsed.data.budgetDailyPaise ?? null,
        cpcBidPaise: parsed.data.cpcBidPaise ?? null,
        targetStates: parsed.data.targetStates ?? [],
        targetCities: parsed.data.targetCities ?? [],
        targetLocalities: parsed.data.targetLocalities ?? [],
        status: "DRAFT",
      },
    });

    return NextResponse.json({ success: true, data: { id: campaign.id } });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
