import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";
import { toNum } from "@/lib/utils/format";

const SaveSchema = z.object({
  projectId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid project ID" }, { status: 400 });
    }

    const { projectId } = parsed.data;

    const existing = await prisma.userSavedProject.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });

    if (existing) {
      await prisma.userSavedProject.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { saved: false } });
    }

    await prisma.userSavedProject.create({
      data: { userId: user.id, projectId },
    });
    return NextResponse.json({ success: true, data: { saved: true } });
  } catch (error) {
    console.error("Save project error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

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
          include: { state: true, builder: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = saved.map((s) => ({
      savedAt: s.createdAt,
      alertEnabled: s.alertEnabled,
      id: s.project.id,
      name: s.project.name,
      slug: s.project.slug,
      stateSlug: s.project.state.slug,
      city: s.project.city,
      locality: s.project.locality,
      status: s.project.status,
      trustScore: toNum(s.project.trustScore),
      priceMinPaise: s.project.priceMinPaise != null ? Number(s.project.priceMinPaise) : null,
      priceMaxPaise: s.project.priceMaxPaise != null ? Number(s.project.priceMaxPaise) : null,
      builderName: s.project.builder?.name ?? null,
    }));

    return NextResponse.json({ success: true, data: { projects } });
  } catch (error) {
    console.error("Get saved projects error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
