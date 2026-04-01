import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const AddPropertySchema = z.object({
  projectId: z.string().uuid(),
  purchaseDate: z.string().optional(),
  purchasePricePaise: z.number().min(0).optional(),
  unitNumber: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.userSavedProject.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: {
            id: true, name: true, slug: true, reraRegNumber: true,
            trustScore: true, status: true, possessionDateOriginal: true,
            city: true, locality: true, totalUnits: true,
            builder: { select: { name: true, slug: true } },
            state: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { portfolio: saved } });
  } catch (error) {
    console.error("Portfolio error:", error);
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
    const parsed = AddPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    // Save to portfolio (reuse saved projects table with metadata)
    const existing = await prisma.userSavedProject.findFirst({
      where: { userId: user.id, projectId: parsed.data.projectId },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already in portfolio" }, { status: 409 });
    }

    const saved = await prisma.userSavedProject.create({
      data: {
        userId: user.id,
        projectId: parsed.data.projectId,
      },
    });

    return NextResponse.json({ success: true, data: { id: saved.id } });
  } catch (error) {
    console.error("Add to portfolio error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
