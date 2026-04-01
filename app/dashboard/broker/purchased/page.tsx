import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate, formatPaise } from "@/lib/utils/format";

export const metadata: Metadata = { title: "My Purchased Leads" };

export default async function BrokerPurchasedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BROKER") redirect("/dashboard/saved");

  const purchases = await prisma.leadPurchase.findMany({
    where: { purchasedByUserId: user.id },
    include: {
      lead: {
        include: { project: { select: { name: true, city: true } } },
      },
    },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Purchased Leads</h1>
      <p className="mt-1 text-sm text-gray-600">{purchases.length} leads purchased</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Buyer</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Paid</th>
              <th className="px-3 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3 font-medium">{p.lead.buyerName}</td>
                <td className="px-3 py-3 font-mono text-xs">{p.lead.buyerPhone}</td>
                <td className="px-3 py-3 text-xs text-gray-600">{p.lead.buyerEmail ?? "—"}</td>
                <td className="px-3 py-3 text-gray-600">{p.lead.project?.name ?? "—"}</td>
                <td className="px-3 py-3 font-medium">{formatPaise(p.pricePaidPaise)}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{formatDate(p.purchasedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && (
          <p className="py-8 text-center text-gray-500">No leads purchased yet.</p>
        )}
      </div>
    </div>
  );
}
