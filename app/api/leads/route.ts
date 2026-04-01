import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { LeadFormSchema } from "@/lib/validation/lead-form";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LeadFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        },
        { status: 400 },
      );
    }

    const { buyerName, buyerPhone, buyerEmail, budgetRange, message, projectId, builderId, sourceType } = parsed.data;

    // Dedup: same phone + same project within 24 hours (CLAUDE.md rule)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: {
        buyerPhone,
        ...(projectId ? { projectId } : {}),
        createdAt: { gte: oneDayAgo },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: { duplicate: true } });
    }

    const lead = await prisma.lead.create({
      data: {
        buyerName,
        buyerPhone,
        buyerEmail: buyerEmail || null,
        message: message || null,
        budgetRangePaise: budgetRange ? { range: budgetRange } : undefined,
        projectId: projectId || null,
        builderId: builderId || null,
        sourceType,
        sourcePage: request.headers.get("referer") ?? null,
        status: "NEW",
      },
    });

    // Auto-send welcome/checklist email if email provided
    if (buyerEmail && sourceType === "LEAD_MAGNET") {
      try {
        const { sendEmail } = await import("@/lib/email/client");
        const { leadMagnetHtml } = await import("@/lib/email/templates");
        await sendEmail({
          to: buyerEmail,
          subject: "Your Free RERA Buyer's Checklist — ReraPedia",
          html: leadMagnetHtml(buyerName),
        });
      } catch (emailError) {
        console.error("Failed to send lead magnet email:", emailError);
      }
    }

    return NextResponse.json({ success: true, data: { id: lead.id } });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
