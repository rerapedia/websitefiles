import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { AdApprovalActions } from "./approval-actions";

export const metadata: Metadata = { title: "Admin: Ad Approvals" };

export default async function AdminAdsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const pendingCreatives = await prisma.adCreative.findMany({
    where: { isApproved: false },
    include: {
      campaign: {
        select: { campaignName: true, adType: true },
        include: { advertiser: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ad Approvals</h1>
      <p className="mt-1 text-sm text-gray-600">{pendingCreatives.length} creatives pending review</p>

      <div className="mt-6 space-y-4">
        {pendingCreatives.map((c) => (
          <div key={c.id} className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{c.headline}</h3>
                <p className="mt-1 text-sm text-gray-600">{c.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>Campaign: {c.campaign.campaignName}</span>
                  <span>Type: {c.campaign.adType.replace(/_/g, " ")}</span>
                  <span>By: {c.campaign.advertiser.name ?? c.campaign.advertiser.email}</span>
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-gray-500">URL: </span>
                  <a href={c.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                    {c.destinationUrl}
                  </a>
                </div>
              </div>
              {c.imageUrl && (
                <img src={c.imageUrl} alt={c.headline ?? ""} className="h-16 w-24 rounded border object-cover" />
              )}
            </div>
            <div className="mt-4">
              <AdApprovalActions creativeId={c.id} />
            </div>
          </div>
        ))}
        {pendingCreatives.length === 0 && (
          <p className="py-8 text-center text-gray-500">No creatives pending approval.</p>
        )}
      </div>
    </div>
  );
}
