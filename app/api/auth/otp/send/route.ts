import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { PhoneOtpRequestSchema } from "@/lib/validation/auth";
import { generateOtp } from "@/lib/auth/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PhoneOtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Valid phone number required" }, { status: 400 });
    }

    const { phone } = parsed.data;
    const code = generateOtp();

    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        type: "PHONE_OTP",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    // Sprint 4: Log OTP to console (real SMS via Twilio/MSG91 in later sprint)
    console.log(`[OTP] Phone: ${phone}, Code: ${code}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
