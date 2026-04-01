import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { GstinSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "BUILDER") {
      return NextResponse.json({ success: false, error: "Builder role required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = GstinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join("; ") },
        { status: 400 },
      );
    }

    const { gstin, builderSlug } = parsed.data;

    const builder = await prisma.builder.findFirst({
      where: { slug: builderSlug, deletedAt: null },
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Builder not found" }, { status: 404 });
    }

    if (builder.isClaimed) {
      return NextResponse.json({ success: false, error: "Profile already claimed" }, { status: 409 });
    }

    await prisma.builder.update({
      where: { id: builder.id },
      data: {
        isClaimed: true,
        claimedByUserId: user.id,
        gstin,
      },
    });

    return NextResponse.json({ success: true, data: { builderId: builder.id } });
  } catch (error) {
    console.error("Builder claim error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
