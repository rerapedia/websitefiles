import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_KEY_SECRET ?? "";

    if (secret && !verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event as string;
    const payload = event.payload?.subscription?.entity;

    if (!payload?.id) {
      return NextResponse.json({ received: true });
    }

    const razorpaySubscriptionId = payload.id as string;
    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId },
    });

    if (!subscription) {
      console.log(`Webhook: no subscription found for ${razorpaySubscriptionId}`);
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "subscription.activated":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE" },
        });
        break;

      case "subscription.charged":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ),
          },
        });
        break;

      case "subscription.cancelled":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "CANCELLED", cancelledAt: new Date() },
        });
        break;

      case "payment.failed":
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "PAST_DUE" },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
