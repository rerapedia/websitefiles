import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const builder = await prisma.builder.findFirst({
      where: { claimedByUserId: user.id, deletedAt: null },
      include: { projects: { select: { id: true } } },
    });

    if (!builder) {
      return NextResponse.json({ success: true, data: { leads: [] } });
    }

    const projectIds = builder.projects.map((p) => p.id);

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { builderId: builder.id },
          { projectId: { in: projectIds } },
        ],
      },
      include: {
        project: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: { leads } });
  } catch (error) {
    console.error("Builder leads error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

const UpdateLeadSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    await prisma.lead.update({
      where: { id: parsed.data.leadId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
