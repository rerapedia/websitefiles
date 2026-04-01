import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { ProjectCard } from "@/components/ui/project-card";
import { toNum } from "@/lib/utils/format";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Saved Projects" };

export default async function SavedProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard/saved");

  const saved = await prisma.userSavedProject.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: { state: true, builder: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Saved Projects</h1>
      <p className="mt-1 text-sm text-gray-600">
        {saved.length} project{saved.length !== 1 ? "s" : ""} saved
      </p>

      {saved.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saved.map((s) => (
            <ProjectCard
              key={s.project.id}
              name={s.project.name}
              slug={s.project.slug}
              stateSlug={s.project.state.slug}
              builderName={s.project.builder?.name ?? null}
              city={s.project.city}
              locality={s.project.locality}
              status={s.project.status}
              trustScore={toNum(s.project.trustScore)}
              priceMinPaise={s.project.priceMinPaise != null ? Number(s.project.priceMinPaise) : null}
              priceMaxPaise={s.project.priceMaxPaise != null ? Number(s.project.priceMaxPaise) : null}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-medium text-gray-700">No saved projects yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Click the heart icon on any project to save it here.
          </p>
        </div>
      )}
    </div>
  );
}
