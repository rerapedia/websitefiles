import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const AlertConfigSchema = z.object({
  projectId: z.string().uuid().optional(),
  builderId: z.string().uuid().optional(),
  alertTypes: z.array(z.enum([
    "SCORE_DROP", "DEADLINE_EXTENSION", "NEW_COMPLAINT",
    "STATUS_CHANGE", "NEW_DOCUMENT", "PRICE_CHANGE",
  ])),
  deliveryEmail: z.boolean().default(true),
  deliveryDashboard: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Return user's search history as saved alert configs
    const alerts = await prisma.userSearchHistory.findMany({
      where: { userId: user.id },
      orderBy: { searchedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: { alerts } });
  } catch (error) {
    console.error("Alerts error:", error);
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
    const parsed = AlertConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const alert = await prisma.userSearchHistory.create({
      data: {
        userId: user.id,
        query: `alert:${parsed.data.alertTypes.join(",")}`,
        filtersJson: {
          projectId: parsed.data.projectId,
          builderId: parsed.data.builderId,
          alertTypes: parsed.data.alertTypes,
          deliveryEmail: parsed.data.deliveryEmail,
          deliveryDashboard: parsed.data.deliveryDashboard,
        },
      },
    });

    return NextResponse.json({ success: true, data: { id: alert.id } });
  } catch (error) {
    console.error("Create alert error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
