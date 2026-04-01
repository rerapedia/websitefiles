import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatPaise, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Broker Analytics" };

export default async function BrokerAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BROKER") redirect("/dashboard/saved");

  const purchases = await prisma.leadPurchase.findMany({
    where: { purchasedByUserId: user.id },
    include: { lead: { include: { project: { select: { name: true, city: true } } } } },
    orderBy: { purchasedAt: "desc" },
  });

  const totalSpent = purchases.reduce((sum, p) => sum + p.pricePaidPaise, 0);
  const thisMonth = purchases.filter(
    (p) => p.purchasedAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const thisMonthSpent = thisMonth.reduce((sum, p) => sum + p.pricePaidPaise, 0);

  // Lead status breakdown
  const statusCounts: Record<string, number> = {};
  for (const p of purchases) {
    const status = p.lead.status;
    statusCounts[status] = (statusCounts[status] ?? 0) + 1;
  }

  // Top cities
  const cityCounts: Record<string, number> = {};
  for (const p of purchases) {
    const city = p.lead.project?.city ?? "Other";
    cityCounts[city] = (cityCounts[city] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
      <p className="mt-1 text-sm text-gray-600">Track your lead purchases and conversion metrics</p>

      {/* Stats cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Total Leads Purchased</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{purchases.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{formatPaise(totalSpent)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{thisMonth.length} leads</p>
          <p className="text-xs text-gray-400">{formatPaise(thisMonthSpent)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-500">Avg Cost Per Lead</p>
          <p className="mt-1 text-2xl font-bold text-brand-primary">
            {purchases.length > 0 ? formatPaise(Math.round(totalSpent / purchases.length)) : "—"}
          </p>
        </div>
      </div>

      {/* Lead status breakdown */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900">Lead Status Breakdown</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{status.replace(/_/g, " ")}</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">{count}</span>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && (
              <p className="text-sm text-gray-500">No leads purchased yet</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <h2 className="font-semibold text-gray-900">Top Cities</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(cityCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{city}</span>
                  <span className="text-sm font-medium text-gray-900">{count} leads</span>
                </div>
              ))}
            {Object.keys(cityCounts).length === 0 && (
              <p className="text-sm text-gray-500">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent purchases */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <h2 className="font-semibold text-gray-900">Recent Purchases</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Buyer</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">City</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.slice(0, 20).map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{p.lead.buyerName}</td>
                  <td className="px-3 py-2 text-gray-600">{p.lead.project?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{p.lead.project?.city ?? "—"}</td>
                  <td className="px-3 py-2 font-medium">{formatPaise(p.pricePaidPaise)}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{formatDate(p.purchasedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {purchases.length === 0 && (
            <p className="py-8 text-center text-gray-500">No purchases yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
