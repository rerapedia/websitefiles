import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin: Leads" };

type Props = {
  searchParams: Promise<{ status?: string; source?: string; page?: string }>;
};

export default async function AdminLeadsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 50;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.source) where.sourceType = params.source;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        project: { select: { name: true } },
        builder: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
          <p className="mt-1 text-sm text-gray-600">{total} total leads</p>
        </div>
      </div>

      {/* Filters */}
      <form className="mt-4 flex flex-wrap gap-3">
        <select name="status" defaultValue={params.status ?? ""} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST", "SPAM"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="source" defaultValue={params.source ?? ""} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
          <option value="">All Sources</option>
          {["PROJECT_PAGE", "BUILDER_PAGE", "SEARCH_PAGE"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-brand-primary px-4 py-1.5 text-sm text-white hover:bg-blue-700">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Buyer</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3 font-medium">{lead.buyerName}</td>
                <td className="px-3 py-3 font-mono text-xs">{lead.buyerPhone}</td>
                <td className="px-3 py-3 text-xs text-gray-600">{lead.buyerEmail ?? "—"}</td>
                <td className="px-3 py-3 text-gray-600">{lead.project?.name ?? "—"}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{lead.sourceType}</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[lead.status] ?? ""}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <a href={`?page=${page - 1}&status=${params.status ?? ""}&source=${params.source ?? ""}`} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">Previous</a>
        )}
        {total > page * limit && (
          <a href={`?page=${page + 1}&status=${params.status ?? ""}&source=${params.source ?? ""}`} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">Next</a>
        )}
      </div>
    </div>
  );
}
