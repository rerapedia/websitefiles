import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";

export const metadata: Metadata = { title: "My Portfolio" };

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const portfolio = await prisma.userSavedProject.findMany({
    where: { userId: user.id },
    include: {
      project: {
        select: {
          id: true, name: true, slug: true, reraRegNumber: true,
          trustScore: true, status: true, possessionDateOriginal: true,
          city: true, locality: true, totalUnits: true,
          completionPercentage: true,
          builder: { select: { name: true, slug: true } },
          state: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
      <p className="mt-1 text-sm text-gray-600">{portfolio.length} properties tracked</p>

      <div className="mt-6 space-y-4">
        {portfolio.map((item) => {
          const p = item.project;
          return (
            <div key={item.id} className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/project/${p.state?.slug}/${p.slug}`} className="text-lg font-semibold text-brand-primary hover:underline">
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {p.locality}, {p.city} | {p.builder?.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">RERA: {p.reraRegNumber}</p>
                </div>
                <TrustScoreBadge score={Number(p.trustScore ?? 0)} />
              </div>

              <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{p.status?.replace(/_/g, " ") ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Possession</p>
                  <p className="font-medium">{p.possessionDateOriginal ? formatDate(p.possessionDateOriginal) : "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Units</p>
                  <p className="font-medium">{p.totalUnits ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completion</p>
                  <p className="font-medium">{p.completionPercentage != null ? `${p.completionPercentage}%` : "—"}</p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Link href={`/dashboard/investor/reports?project=${p.slug}`} className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Download Report
                </Link>
                <Link href={`/dashboard/investor/alerts?project=${p.id}`} className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Set Alerts
                </Link>
              </div>
            </div>
          );
        })}

        {portfolio.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No properties in your portfolio yet.</p>
            <Link href="/search" className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline">
              Browse projects to add
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
