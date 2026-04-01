import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const slug = request.nextUrl.searchParams.get("project");
    if (!slug) {
      return NextResponse.json({ success: false, error: "project slug required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { slug, deletedAt: null },
      include: {
        builder: { select: { name: true, slug: true } },
        state: { select: { name: true } },
        complaints: { select: { id: true, subject: true, status: true, filedDate: true } },
        timeline: { orderBy: { detectedAt: "desc" }, take: 10 },
        documents: { select: { documentType: true, documentUrl: true, uploadedAt: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    // Return structured data for PDF generation on client
    return NextResponse.json({
      success: true,
      data: {
        project: {
          name: project.name,
          reraNumber: project.reraRegNumber,
          trustScore: project.trustScore,
          status: project.status,
          city: project.city,
          locality: project.locality,
          possessionDate: project.possessionDateOriginal,
          totalUnits: project.totalUnits,
          completionPercentage: project.completionPercentage,
          registrationDate: project.reraRegistrationDate,
          expiryDate: project.reraExpiryDate,
        },
        builder: project.builder,
        state: project.state,
        complaints: project.complaints,
        timeline: project.timeline,
        documents: project.documents,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report data error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
