import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { razorpay } from "@/lib/payments/razorpay";
import { z } from "zod";

const SubscribeSchema = z.object({ planId: z.string().uuid() });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid plan ID" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: parsed.data.planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    if (!razorpay) {
      // Dev mode: create subscription without Razorpay
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({
        success: true,
        data: { subscriptionId: subscription.id, devMode: true },
      });
    }

    // Create Razorpay subscription
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: plan.slug, // Map to actual Razorpay plan IDs when configured
      total_count: 12,
      quantity: 1,
      notes: { userId: user.id, planSlug: plan.slug },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "TRIALING",
        razorpaySubscriptionId: rzpSubscription.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        razorpaySubscriptionId: rzpSubscription.id,
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
