import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatPaise } from "@/lib/utils/format";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Ad Campaigns" };

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const campaigns = await prisma.adCampaign.findMany({
    where: { advertiserUserId: user.id, deletedAt: null },
    include: {
      creatives: { take: 1 },
      _count: { select: { impressions: true, clicks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    ACTIVE: "bg-green-100 text-green-800",
    PAUSED: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ad Campaigns</h1>
        <Link href="/dashboard/builder/campaigns/new" className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Campaign
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Campaign</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Budget</th>
              <th className="px-3 py-3">Spent</th>
              <th className="px-3 py-3">Impressions</th>
              <th className="px-3 py-3">Clicks</th>
              <th className="px-3 py-3">CTR</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const ctr = c._count.impressions > 0
                ? ((c._count.clicks / c._count.impressions) * 100).toFixed(2)
                : "0.00";
              return (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <Link href={`/dashboard/builder/campaigns/${c.id}`} className="font-medium text-brand-primary hover:underline">
                      {c.campaignName}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-xs">{c.adType.replace(/_/g, " ")}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[c.status] ?? ""}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3">{formatPaise(c.budgetTotalPaise)}</td>
                  <td className="px-3 py-3">{formatPaise(c.spentPaise)}</td>
                  <td className="px-3 py-3">{c._count.impressions.toLocaleString()}</td>
                  <td className="px-3 py-3">{c._count.clicks.toLocaleString()}</td>
                  <td className="px-3 py-3">{ctr}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && (
          <p className="py-8 text-center text-gray-500">No campaigns yet. Create your first ad campaign!</p>
        )}
      </div>
    </div>
  );
}
