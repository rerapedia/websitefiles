import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { VerifyEmailSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { email, code } = parsed.data;

    const record = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type: "EMAIL_VERIFY",
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ success: false, error: "Invalid or expired code" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.updateMany({
        where: { email },
        data: { isVerified: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
