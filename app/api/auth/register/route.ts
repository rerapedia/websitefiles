import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { RegisterSchema } from "@/lib/validation/auth";
import { hashPassword, generateOtp } from "@/lib/auth/helpers";
import { sendWelcomeEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        { status: 400 },
      );
    }

    const { name, email, password, role, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone: phone || null,
      },
    });

    const code = generateOtp();
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        email,
        code,
        type: "EMAIL_VERIFY",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    await sendWelcomeEmail(email, name, code);

    return NextResponse.json({ success: true, data: { userId: user.id } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
