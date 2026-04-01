import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const SaveSearchSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.object({
    city: z.string().optional(),
    budget: z.string().optional(),
    sourceType: z.string().optional(),
  }),
  alertEnabled: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BROKER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const searches = await prisma.userSearchHistory.findMany({
      where: { userId: user.id },
      orderBy: { searchedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: { searches } });
  } catch (error) {
    console.error("Saved searches error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BROKER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SaveSearchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const saved = await prisma.userSearchHistory.create({
      data: {
        userId: user.id,
        query: parsed.data.name,
        filtersJson: parsed.data.filters,
      },
    });

    return NextResponse.json({ success: true, data: { id: saved.id } });
  } catch (error) {
    console.error("Save search error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
