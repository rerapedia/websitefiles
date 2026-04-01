import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import clsx from "clsx";
import { Activity, Database, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Admin: Scraper Health" };

export default async function AdminScrapersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const states = await prisma.state.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const scraperHealth = await Promise.all(
    states.map(async (state) => {
      const [projectCount, builderCount, recentCount, lastProject] = await Promise.all([
        prisma.project.count({ where: { stateId: state.id, deletedAt: null } }),
        prisma.builder.count({
          where: { projects: { some: { stateId: state.id } } },
        }),
        prisma.project.count({
          where: {
            stateId: state.id,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.project.findFirst({
          where: { stateId: state.id },
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        }),
      ]);

      const lastUpdated = lastProject?.updatedAt;
      const hoursSince = lastUpdated
        ? (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60)
        : null;

      let health: "green" | "yellow" | "red" = "red";
      if (hoursSince !== null) {
        if (hoursSince < 48) health = "green";
        else if (hoursSince < 168) health = "yellow";
      }

      // District breakdown
      const districts = await prisma.project.groupBy({
        by: ["district"],
        where: { stateId: state.id, deletedAt: null },
        _count: true,
        orderBy: { _count: { district: "desc" } },
        take: 5,
      });

      return { state, projectCount, builderCount, recentCount, lastUpdated, hoursSince, health, districts };
    }),
  );

  const totalProjects = scraperHealth.reduce((s, h) => s + h.projectCount, 0);
  const totalBuilders = scraperHealth.reduce((s, h) => s + h.builderCount, 0);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scraper Health</h1>
          <p className="text-sm text-gray-600">Monitor data freshness and scraper status per state</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Database className="h-4 w-4" /> Total Projects</div>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{totalProjects.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Database className="h-4 w-4" /> Total Builders</div>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{totalBuilders.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="h-4 w-4" /> States Active</div>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{states.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Activity className="h-4 w-4" /> Added This Week</div>
          <p className="mt-1 text-2xl font-bold text-brand-primary">{scraperHealth.reduce((s, h) => s + h.recentCount, 0)}</p>
        </div>
      </div>

      {/* Per-state cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scraperHealth.map(({ state, projectCount, builderCount, recentCount, lastUpdated, hoursSince, health, districts }) => (
          <div key={state.id} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{state.name}</h3>
              <div className={clsx(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                health === "green" && "bg-green-100 text-green-700",
                health === "yellow" && "bg-yellow-100 text-yellow-700",
                health === "red" && "bg-red-100 text-red-700",
              )}>
                {health === "green" ? <CheckCircle className="h-3 w-3" /> : health === "yellow" ? <AlertTriangle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {health === "green" ? "Fresh" : health === "yellow" ? "Stale" : "No Data"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-lg font-bold text-gray-900">{projectCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Projects</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-lg font-bold text-gray-900">{builderCount}</p>
                <p className="text-xs text-gray-500">Builders</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-lg font-bold text-green-600">+{recentCount}</p>
                <p className="text-xs text-gray-500">This Week</p>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>Last updated: <span className="font-medium text-gray-900">{lastUpdated ? formatDate(lastUpdated) : "Never"}</span>
                {hoursSince !== null && <span className="text-gray-400"> ({Math.round(hoursSince)}h ago)</span>}
              </p>
              <p>Portal: <a href={state.reraWebsiteUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline text-xs">{state.reraWebsiteUrl ?? "N/A"}</a></p>
            </div>

            {/* Top districts */}
            {districts.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Top Districts</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {districts.map((d) => (
                    <span key={d.district ?? "unknown"} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-primary">
                      {d.district ?? "N/A"}: {d._count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cron schedule */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <h2 className="font-semibold text-gray-900">Scheduled Scraper Runs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Scraper</th>
                <th className="px-3 py-2">Schedule</th>
                <th className="px-3 py-2">Next Run</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Haryana RERA", schedule: "Daily at 3:00 AM IST", next: "Tomorrow 3:00 AM" },
                { name: "Delhi RERA", schedule: "Daily at 4:00 AM IST", next: "Tomorrow 4:00 AM" },
                { name: "Meilisearch Sync", schedule: "Daily at 5:00 AM IST", next: "Tomorrow 5:00 AM" },
                { name: "Email Alerts", schedule: "Daily at 8:00 AM IST", next: "Tomorrow 8:00 AM" },
              ].map((cron) => (
                <tr key={cron.name} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{cron.name}</td>
                  <td className="px-3 py-2 text-gray-600">{cron.schedule}</td>
                  <td className="px-3 py-2 text-gray-600">{cron.next}</td>
                  <td className="px-3 py-2"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
