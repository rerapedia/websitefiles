import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "BROKER") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const city = params.get("city");
    const budget = params.get("budget");
    const status = params.get("status");

    const where: Record<string, unknown> = {
      status: status ?? "NEW",
      purchases: { none: {} },
    };
    if (city) {
      where.project = { city: { contains: city, mode: "insensitive" } };
    }
    if (budget) {
      where.budgetRangePaise = { path: ["range"], equals: budget };
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        project: { select: { name: true, city: true, locality: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Mask phone for unpurchased leads
    const masked = leads.map((l) => ({
      id: l.id,
      buyerName: l.buyerName,
      buyerPhone: l.buyerPhone.slice(0, 2) + "****" + l.buyerPhone.slice(-2),
      projectName: l.project?.name ?? "General Inquiry",
      city: l.project?.city ?? "",
      locality: l.project?.locality ?? "",
      budgetRange: (l.budgetRangePaise as Record<string, string> | null)?.range ?? "",
      sourceType: l.sourceType,
      createdAt: l.createdAt,
      pricePaise: getLeadPrice(l.budgetRangePaise as Record<string, string> | null),
    }));

    return NextResponse.json({ success: true, data: { leads: masked } });
  } catch (error) {
    console.error("Broker leads error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

function getLeadPrice(budget: Record<string, string> | null): number {
  const range = budget?.range ?? "";
  const prices: Record<string, number> = {
    ABOVE_5CR: 120000,  // ₹1,200
    "2CR_5CR": 80000,   // ₹800
    "1CR_2CR": 50000,   // ₹500
    "50L_1CR": 30000,   // ₹300
    "25L_50L": 20000,   // ₹200
    UNDER_25L: 15000,   // ₹150
  };
  return prices[range] ?? 25000; // Default ₹250
}
