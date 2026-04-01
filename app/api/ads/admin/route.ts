import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const ApproveSchema = z.object({
  creativeId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const pendingCreatives = await prisma.adCreative.findMany({
      where: { isApproved: false },
      include: {
        campaign: {
          select: { campaignName: true, adType: true, status: true, advertiserUserId: true },
          include: { advertiser: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { creatives: pendingCreatives } });
  } catch (error) {
    console.error("Admin ads error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ApproveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { creativeId, action } = parsed.data;

    if (action === "approve") {
      await prisma.adCreative.update({
        where: { id: creativeId },
        data: { isApproved: true },
      });

      // Activate the campaign
      const creative = await prisma.adCreative.findUnique({
        where: { id: creativeId },
        select: { campaignId: true },
      });
      if (creative) {
        await prisma.adCampaign.update({
          where: { id: creative.campaignId },
          data: { status: "ACTIVE", startDate: new Date() },
        });
      }
    } else {
      // Reject — delete creative and set campaign back to draft
      const creative = await prisma.adCreative.findUnique({
        where: { id: creativeId },
        select: { campaignId: true },
      });
      await prisma.adCreative.delete({ where: { id: creativeId } });
      if (creative) {
        await prisma.adCampaign.update({
          where: { id: creative.campaignId },
          data: { status: "REJECTED" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin ad action error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
