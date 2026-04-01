import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const type = params.get("type") ?? "builders"; // builders or projects
    const slugs = params.get("slugs")?.split(",").filter(Boolean) ?? [];

    if (slugs.length < 2 || slugs.length > 5) {
      return NextResponse.json({ success: false, error: "Provide 2-5 slugs" }, { status: 400 });
    }

    if (type === "builders") {
      const builders = await prisma.builder.findMany({
        where: { slug: { in: slugs }, deletedAt: null },
        include: {
          projects: {
            where: { deletedAt: null },
            select: {
              trustScore: true, status: true, possessionDateOriginal: true,
              completionPercentage: true, name: true,
            },
          },
          _count: { select: { projects: true } },
        },
      });

      const comparison = builders.map((b) => {
        const scores = b.projects.map((p) => Number(p.trustScore ?? 0)).filter((s) => s > 0);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length) : 0;
        const completed = b.projects.filter((p) => p.status === "COMPLETED").length;
        const delayed = b.projects.filter((p) => {
          if (!p.possessionDateOriginal) return false;
          return p.status !== "COMPLETED" && new Date(p.possessionDateOriginal) < new Date();
        }).length;

        return {
          name: b.name,
          slug: b.slug,
          totalProjects: b._count.projects,
          avgTrustScore: avgScore,
          completedProjects: completed,
          delayedProjects: delayed,
          onTimeRate: b._count.projects > 0 ? Math.round((completed / b._count.projects) * 100) : 0,
        };
      });

      return NextResponse.json({ success: true, data: { type: "builders", items: comparison } });
    }

    // Projects comparison
    const projects = await prisma.project.findMany({
      where: { slug: { in: slugs }, deletedAt: null },
      include: {
        builder: { select: { name: true, slug: true } },
        state: { select: { name: true } },
        complaints: { select: { id: true } },
        timeline: { orderBy: { detectedAt: "desc" }, take: 5 },
      },
    });

    const comparison = projects.map((p) => ({
      name: p.name,
      slug: p.slug,
      builderName: p.builder?.name ?? "Unknown",
      city: p.city,
      trustScore: Number(p.trustScore ?? 0),
      status: p.status,
      reraNumber: p.reraRegNumber,
      possessionDate: p.possessionDateOriginal,
      totalUnits: p.totalUnits,
      completionPercentage: Number(p.completionPercentage ?? 0),
      complaintCount: p.complaints.length,
      recentChanges: p.timeline.length,
    }));

    return NextResponse.json({ success: true, data: { type: "projects", items: comparison } });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
