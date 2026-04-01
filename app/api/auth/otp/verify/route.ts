import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PhoneOtpVerifySchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PhoneOtpVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { phone, code } = parsed.data;

    const record = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        type: "PHONE_OTP",
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    // Find or create user by phone
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: "BUYER", isVerified: true },
      });
    }

    return NextResponse.json({ success: true, data: { userId: user.id } });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
