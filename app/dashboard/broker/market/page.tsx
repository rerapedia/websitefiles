import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { toNum } from "@/lib/utils/format";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { TrendingUp, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Market Intelligence" };

export default async function BrokerMarketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BROKER") redirect("/dashboard/saved");

  // New launches this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newLaunches = await prisma.project.findMany({
    where: { createdAt: { gte: oneWeekAgo }, deletedAt: null },
    include: { builder: { select: { name: true } }, state: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Top performing localities (by project count)
  const topLocalities = await prisma.project.groupBy({
    by: ["city", "district"],
    where: { deletedAt: null, trustScore: { not: null } },
    _count: true,
    _avg: { trustScore: true },
    orderBy: { _count: { city: "desc" } },
    take: 10,
  });

  // Lead demand by city
  const leadDemand = await prisma.lead.groupBy({
    by: ["sourceType"],
    _count: true,
    where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="text-sm text-gray-600">New launches, trends, and lead demand insights</p>
        </div>
      </div>

      {/* New launches this week */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">New Launches This Week ({newLaunches.length})</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {newLaunches.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.builder?.name} | {p.city}</p>
                <p className="text-xs text-gray-400">{p.state.name}</p>
              </div>
              <TrustScoreBadge score={toNum(p.trustScore)} size="sm" />
            </div>
          ))}
          {newLaunches.length === 0 && <p className="text-gray-500">No new launches this week.</p>}
        </div>
      </div>

      {/* Top localities */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapPin className="h-5 w-5" /> Top Localities by Project Count
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {topLocalities.map((loc, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <div>
                <h3 className="font-semibold text-gray-900">{loc.city ?? loc.district ?? "Unknown"}</h3>
                <p className="text-sm text-gray-600">{loc._count} projects</p>
              </div>
              <TrustScoreBadge score={Math.round(Number(loc._avg.trustScore ?? 0))} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Lead demand */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <h2 className="font-semibold text-gray-900">Lead Demand (Last 30 Days)</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {leadDemand.map((d) => (
            <div key={d.sourceType} className="rounded-lg bg-gray-50 px-4 py-2">
              <p className="text-lg font-bold text-brand-primary">{d._count}</p>
              <p className="text-xs text-gray-500">{d.sourceType.replace(/_/g, " ")}</p>
            </div>
          ))}
          {leadDemand.length === 0 && <p className="text-sm text-gray-500">No lead data yet.</p>}
        </div>
      </div>
    </div>
  );
}
