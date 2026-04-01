import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatPaise } from "@/lib/utils/format";
import { Users, FileText, CreditCard, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    recentLeads,
    totalUsers,
    activeSubscriptions,
    usersByRole,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
      where: { deletedAt: null },
    }),
  ]);

  // Calculate MRR from active subscriptions
  const activeSubs = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true },
  });
  const mrrPaise = activeSubs.reduce((sum, s) => sum + s.plan.priceMonthlyPaise, 0);

  const stats = [
    { label: "Total Leads", value: totalLeads, sub: `${recentLeads} last 30 days`, icon: FileText },
    { label: "Total Users", value: totalUsers, sub: "", icon: Users },
    { label: "Active Subscriptions", value: activeSubscriptions, sub: "", icon: CreditCard },
    { label: "MRR", value: formatPaise(mrrPaise), sub: "Monthly Recurring Revenue", icon: Activity },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
            {stat.sub && <p className="mt-0.5 text-xs text-gray-500">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Users by role */}
      <div className="mt-8 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
        <h2 className="font-semibold text-gray-900">Users by Role</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {usersByRole.map((r) => (
            <div key={r.role} className="rounded bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium">{r.role}</span>: {r._count}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/admin/leads" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary">
          <h3 className="font-semibold">Leads Management</h3>
          <p className="mt-1 text-sm text-gray-600">View all leads, filter, export CSV</p>
        </Link>
        <Link href="/dashboard/admin/scrapers" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary">
          <h3 className="font-semibold">Scraper Health</h3>
          <p className="mt-1 text-sm text-gray-600">Monitor scraper status per state</p>
        </Link>
        <Link href="/dashboard/admin/users" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary">
          <h3 className="font-semibold">User Management</h3>
          <p className="mt-1 text-sm text-gray-600">Browse users, roles, subscriptions</p>
        </Link>
      </div>
    </div>
  );
}
