import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { toNum, formatStatus } from "@/lib/utils/format";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";

export const metadata: Metadata = { title: "My Projects" };

export default async function BuilderProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "BUILDER") redirect("/dashboard/saved");

  const builder = await prisma.builder.findFirst({
    where: { claimedByUserId: user.id, deletedAt: null },
    include: {
      projects: {
        where: { deletedAt: null },
        include: { state: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!builder) redirect("/dashboard/builder");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
      <p className="mt-1 text-sm text-gray-600">{builder.projects.length} projects registered</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">City</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">RERA Number</th>
              <th className="px-3 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {builder.projects.map((project) => (
              <tr key={project.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3">
                  <Link href={`/project/${project.state.slug}/${project.slug}`} className="font-medium text-brand-primary hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-gray-600">{project.city ?? "—"}</td>
                <td className="px-3 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{formatStatus(project.status)}</span>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-gray-500">{project.reraRegNumber}</td>
                <td className="px-3 py-3"><TrustScoreBadge score={toNum(project.trustScore)} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
