export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { LeadQuerySchema } from "@/lib/validation/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = LeadQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid query params" }, { status: 400 });
    }

    const { dateFrom, dateTo, status, sourceType, page, limit } = parsed.data;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (sourceType) where.sourceType = sourceType;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          project: { select: { name: true, slug: true } },
          builder: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { leads, total, page, limit },
    });
  } catch (error) {
    console.error("Admin leads error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
