import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate, formatPaise } from "@/lib/utils/format";
import { BuyLeadButton } from "./buy-lead-button";

export const metadata: Metadata = { title: "Lead Marketplace" };

function getLeadPricePaise(budget: Record<string, string> | null): number {
  const range = budget?.range ?? "";
  const prices: Record<string, number> = {
    ABOVE_5CR: 120000, "2CR_5CR": 80000, "1CR_2CR": 50000,
    "50L_1CR": 30000, "25L_50L": 20000, UNDER_25L: 15000,
  };
  return prices[range] ?? 25000;
}

const BUDGET_LABELS: Record<string, string> = {
  UNDER_25L: "Under ₹25L", "25L_50L": "₹25L-50L", "50L_1CR": "₹50L-1Cr",
  "1CR_2CR": "₹1-2Cr", "2CR_5CR": "₹2-5Cr", ABOVE_5CR: "Above ₹5Cr",
};

export default async function BrokerLeadMarketplacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BROKER") redirect("/dashboard/saved");

  const leads = await prisma.lead.findMany({
    where: { status: "NEW", purchases: { none: {} } },
    include: { project: { select: { name: true, city: true, locality: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Lead Marketplace</h1>
      <p className="mt-1 text-sm text-gray-600">{leads.length} leads available for purchase</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {leads.map((lead) => {
          const budget = lead.budgetRangePaise as Record<string, string> | null;
          const price = getLeadPricePaise(budget);
          const budgetLabel = BUDGET_LABELS[budget?.range ?? ""] ?? "Not specified";

          return (
            <div key={lead.id} className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {lead.project?.name ?? "General Inquiry"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {[lead.project?.locality, lead.project?.city].filter(Boolean).join(", ") || "NCR"}
                  </p>
                </div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {budgetLabel}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  <span>{lead.buyerName.split(" ")[0]}***</span>
                  <span className="mx-2">|</span>
                  <span>{formatDate(lead.createdAt)}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatPaise(price)}</span>
              </div>

              <div className="mt-3">
                <BuyLeadButton leadId={lead.id} price={price} />
              </div>
            </div>
          );
        })}
      </div>

      {leads.length === 0 && (
        <p className="mt-8 text-center text-gray-500">No leads available right now. Check back soon!</p>
      )}
    </div>
  );
}
