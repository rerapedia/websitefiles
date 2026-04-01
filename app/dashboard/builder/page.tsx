import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { toNum } from "@/lib/utils/format";
import { Building2, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Builder Dashboard" };

export default async function BuilderDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard/builder");
  if (user.role !== "BUILDER") redirect("/dashboard/saved");

  const builder = await prisma.builder.findFirst({
    where: { claimedByUserId: user.id, deletedAt: null },
    include: { projects: { where: { deletedAt: null } } },
  });

  if (!builder) {
    return (
      <div className="py-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">No Builder Profile Claimed</h2>
        <p className="mt-2 text-gray-600">Search for your builder profile and claim it to access the dashboard.</p>
        <Link href="/search" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Find My Profile
        </Link>
      </div>
    );
  }

  const projectIds = builder.projects.map((p) => p.id);
  const leadCount = await prisma.lead.count({
    where: {
      OR: [
        { builderId: builder.id },
        { projectId: { in: projectIds } },
      ],
    },
  });

  const stats = [
    { label: "Projects", value: builder.projects.length, icon: Building2 },
    { label: "Total Leads", value: leadCount, icon: Users },
    { label: "Avg Trust Score", value: toNum(builder.avgTrustScore) ?? "N/A", icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard: {builder.name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center gap-3">
              <stat.icon className="h-5 w-5 text-brand-primary" />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/builder/projects" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary hover:shadow-sm">
          <h3 className="font-semibold text-gray-900">My Projects</h3>
          <p className="mt-1 text-sm text-gray-600">View and manage your RERA registered projects</p>
        </Link>
        <Link href="/dashboard/builder/leads" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary hover:shadow-sm">
          <h3 className="font-semibold text-gray-900">Leads Inbox</h3>
          <p className="mt-1 text-sm text-gray-600">View buyer inquiries and update lead status</p>
        </Link>
        <Link href="/dashboard/builder/settings" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary hover:shadow-sm">
          <h3 className="font-semibold text-gray-900">Profile Settings</h3>
          <p className="mt-1 text-sm text-gray-600">Update your builder profile information</p>
        </Link>
        <Link href="/pricing" className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary hover:shadow-sm">
          <h3 className="font-semibold text-gray-900">Upgrade Plan</h3>
          <p className="mt-1 text-sm text-gray-600">Unlock premium features and lead access</p>
        </Link>
      </div>
    </div>
  );
}
