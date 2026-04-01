import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { ClaimActions } from "./claim-actions";

export const metadata: Metadata = { title: "Admin: Builder Claims" };

export default async function AdminClaimsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  // Find builders that have been claimed but may need verification
  const claimedBuilders = await prisma.builder.findMany({
    where: { isClaimed: true, deletedAt: null },
    include: {
      claimedBy: { select: { id: true, name: true, email: true, createdAt: true } },
      _count: { select: { projects: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Find pending claim requests (users who registered as BUILDER)
  const pendingBuilders = await prisma.user.findMany({
    where: { role: "BUILDER", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Builder Claims</h1>
      <p className="mt-1 text-sm text-gray-600">Verify and manage builder profile claims</p>

      {/* Pending claims */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Builder Users ({pendingBuilders.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Registered</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingBuilders.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{u.name ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{u.email}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Builder</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claimed profiles */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Claimed Profiles ({claimedBuilders.length})</h2>
        <div className="mt-4 space-y-4">
          {claimedBuilders.map((builder) => (
            <div key={builder.id} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{builder.name}</h3>
                  <p className="text-sm text-gray-600">{builder._count.projects} projects | GSTIN: {builder.gstin ?? "Not provided"}</p>
                  {builder.claimedBy && (
                    <p className="mt-1 text-xs text-gray-500">
                      Claimed by: {builder.claimedBy.name} ({builder.claimedBy.email}) on {formatDate(builder.updatedAt)}
                    </p>
                  )}
                </div>
                <ClaimActions builderId={builder.id} />
              </div>
            </div>
          ))}
          {claimedBuilders.length === 0 && <p className="text-gray-500">No claimed profiles yet.</p>}
        </div>
      </div>
    </div>
  );
}
