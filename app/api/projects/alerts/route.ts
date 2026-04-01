import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const ToggleAlertSchema = z.object({
  projectId: z.string().uuid(),
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ToggleAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { projectId, enabled } = parsed.data;

    const saved = await prisma.userSavedProject.findFirst({
      where: { userId: user.id, projectId },
    });

    if (!saved) {
      return NextResponse.json({ success: false, error: "Project not saved" }, { status: 404 });
    }

    await prisma.userSavedProject.update({
      where: { id: saved.id },
      data: { alertEnabled: enabled },
    });

    return NextResponse.json({ success: true, data: { alertEnabled: enabled } });
  } catch (error) {
    console.error("Toggle alert error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
