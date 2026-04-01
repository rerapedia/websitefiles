import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { Bell, AlertTriangle, TrendingDown, FileText, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Alert History" };

const ALERT_ICONS: Record<string, typeof Bell> = {
  SCORE_CHANGE: TrendingDown,
  DEADLINE_EXTENSION: Clock,
  NEW_COMPLAINT: AlertTriangle,
  STATUS_CHANGE: FileText,
};

export default async function InvestorAlertHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // Get timeline events for saved projects
  const savedProjects = await prisma.userSavedProject.findMany({
    where: { userId: user.id },
    include: {
      project: {
        select: {
          name: true, slug: true,
          state: { select: { slug: true } },
          timeline: {
            orderBy: { detectedAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  const allEvents = savedProjects.flatMap((sp) =>
    sp.project.timeline.map((t) => ({
      ...t,
      projectName: sp.project.name,
      projectSlug: sp.project.slug,
      stateSlug: sp.project.state.slug,
    })),
  ).sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime()).slice(0, 50);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light">
          <Bell className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert History</h1>
          <p className="text-sm text-gray-600">All notifications for your tracked projects</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {allEvents.map((event) => {
          const Icon = ALERT_ICONS[event.eventType] ?? Bell;
          return (
            <div key={event.id} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <a href={`/project/${event.stateSlug}/${event.projectSlug}`} className="font-semibold text-gray-900 hover:text-brand-primary">
                    {event.projectName}
                  </a>
                  <span className="text-xs text-gray-400">{formatDate(event.detectedAt)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-primary">
                    {event.eventType.replace(/_/g, " ")}
                  </span>
                  {event.description && <span className="ml-2">{event.description}</span>}
                </p>
                {event.oldValue && event.newValue && (
                  <p className="mt-1 text-xs text-gray-500">{event.oldValue} → {event.newValue}</p>
                )}
              </div>
            </div>
          );
        })}

        {allEvents.length === 0 && (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-gray-500">No alerts yet. Save projects and enable alerts to get notified.</p>
            <a href="/search" className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline">Browse projects</a>
          </div>
        )}
      </div>
    </div>
  );
}
