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
    });

    return NextResponse.json({ success: true, data: { builder } });
  } catch (error) {
    console.error("Get builder profile error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

const UpdateProfileSchema = z.object({
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BUILDER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const builder = await prisma.builder.findFirst({
      where: { claimedByUserId: user.id, deletedAt: null },
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "No claimed profile" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.builder.update({
      where: { id: builder.id },
      data: {
        description: parsed.data.description ?? builder.description,
        website: parsed.data.website || builder.website,
        phone: parsed.data.phone ?? builder.phone,
        email: parsed.data.email || builder.email,
        logoUrl: parsed.data.logoUrl || builder.logoUrl,
      },
    });

    return NextResponse.json({ success: true, data: { builder: updated } });
  } catch (error) {
    console.error("Update builder profile error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
