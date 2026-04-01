import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { getSubscriptionTier } from "@/lib/payments/gate";
import { LeadActions } from "./lead-actions";

export const metadata: Metadata = { title: "Leads Inbox" };

function maskPhone(phone: string): string {
  if (phone.length < 6) return "****";
  return phone.slice(0, 2) + "****" + phone.slice(-4);
}

export default async function BuilderLeadsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BUILDER") redirect("/dashboard/saved");

  const builder = await prisma.builder.findFirst({
    where: { claimedByUserId: user.id, deletedAt: null },
    include: { projects: { select: { id: true } } },
  });

  if (!builder) redirect("/dashboard/builder");

  const tier = await getSubscriptionTier(user.id);
  const showFullPhone = tier === "silver" || tier === "gold";

  const projectIds = builder.projects.map((p) => p.id);
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { builderId: builder.id },
        { projectId: { in: projectIds } },
      ],
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    QUALIFIED: "bg-purple-100 text-purple-800",
    CONVERTED: "bg-green-100 text-green-800",
    LOST: "bg-gray-100 text-gray-800",
    SPAM: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Leads Inbox</h1>
      <p className="mt-1 text-sm text-gray-600">{leads.length} leads received</p>

      {!showFullPhone && (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          Phone numbers are masked. <a href="/pricing" className="font-medium underline">Upgrade to Silver</a> to see full contact details.
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Buyer</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3 font-medium">{lead.buyerName}</td>
                <td className="px-3 py-3 font-mono text-xs">
                  {showFullPhone ? lead.buyerPhone : maskPhone(lead.buyerPhone)}
                </td>
                <td className="px-3 py-3 text-gray-600">{lead.project?.name ?? "—"}</td>
                <td className="px-3 py-3 text-gray-500 text-xs">{formatDate(lead.createdAt)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[lead.status] ?? "bg-gray-100"}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <LeadActions leadId={lead.id} currentStatus={lead.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="py-8 text-center text-gray-500">No leads yet. Leads will appear here when buyers express interest in your projects.</p>
        )}
      </div>
    </div>
  );
}
