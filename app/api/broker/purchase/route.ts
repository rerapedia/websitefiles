import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const PurchaseSchema = z.object({
  leadId: z.string().uuid(),
  razorpayPaymentId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BROKER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = PurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { leadId, razorpayPaymentId } = parsed.data;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { purchases: true },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // Check if already purchased by this broker
    const alreadyPurchased = lead.purchases.some((p) => p.purchasedByUserId === user.id);
    if (alreadyPurchased) {
      return NextResponse.json({ success: false, error: "Already purchased" }, { status: 409 });
    }

    // Calculate price
    const budget = lead.budgetRangePaise as Record<string, string> | null;
    const pricePaise = getLeadPrice(budget);

    // Create purchase record
    const purchase = await prisma.leadPurchase.create({
      data: {
        leadId,
        purchasedByUserId: user.id,
        pricePaidPaise: pricePaise,
      },
    });

    // Create invoice
    const invoiceCount = await prisma.invoice.count();
    await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: `GS-INV-${String(invoiceCount + 1).padStart(6, "0")}`,
        amountPaise: pricePaise,
        taxGstPaise: Math.round(pricePaise * 0.18),
        totalPaise: pricePaise + Math.round(pricePaise * 0.18),
        status: razorpayPaymentId ? "PAID" : "ISSUED",
        razorpayPaymentId: razorpayPaymentId ?? null,
        description: `Lead purchase: ${lead.buyerName}`,
        issuedAt: new Date(),
        paidAt: razorpayPaymentId ? new Date() : null,
      },
    });

    // Return full lead details including unmasked phone
    return NextResponse.json({
      success: true,
      data: {
        purchaseId: purchase.id,
        buyerName: lead.buyerName,
        buyerPhone: lead.buyerPhone,
        buyerEmail: lead.buyerEmail,
      },
    });
  } catch (error) {
    console.error("Lead purchase error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

function getLeadPrice(budget: Record<string, string> | null): number {
  const range = budget?.range ?? "";
  const prices: Record<string, number> = {
    ABOVE_5CR: 120000,
    "2CR_5CR": 80000,
    "1CR_2CR": 50000,
    "50L_1CR": 30000,
    "25L_50L": 20000,
    UNDER_25L: 15000,
  };
  return prices[range] ?? 25000;
}
