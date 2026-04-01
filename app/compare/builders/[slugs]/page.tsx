import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { ComparisonCharts } from "./charts";

interface Props {
  params: { slugs: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugArr = params.slugs.split("-vs-").filter(Boolean);
  const builders = await prisma.builder.findMany({
    where: { slug: { in: slugArr } },
    select: { name: true },
  });
  const names = builders.map((b) => b.name).join(" vs ");
  const url = `/compare/builders/${slugArr.join("-vs-")}`;
  return {
    title: `${names} — Builder Comparison | ReraPedia`,
    description: `Compare ${names} side by side. See trust scores, project delivery record, complaints, and builder reliability on ReraPedia.`,
    alternates: { canonical: url },
    openGraph: { title: `${names} — Builder Comparison`, description: `Compare ${names} trust scores and track records.`, url },
  };
}

export default async function BuilderComparisonPage({ params }: Props) {
  const slugArr = params.slugs.split("-vs-").filter(Boolean);
  if (slugArr.length < 2) notFound();

  const builders = await prisma.builder.findMany({
    where: { slug: { in: slugArr }, deletedAt: null },
    include: {
      projects: {
        where: { deletedAt: null },
        select: { trustScore: true, status: true, possessionDateOriginal: true, name: true, slug: true, completionPercentage: true },
      },
      _count: { select: { projects: true } },
    },
  });

  if (builders.length < 2) notFound();

  const comparison = builders.map((b) => {
    const scores = b.projects.map((p) => Number(p.trustScore ?? 0)).filter((s) => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length) : 0;
    const completed = b.projects.filter((p) => p.status === "COMPLETED").length;
    const delayed = b.projects.filter((p) => p.possessionDateOriginal && p.status !== "COMPLETED" && new Date(p.possessionDateOriginal) < new Date()).length;
    return {
      name: b.name, slug: b.slug, totalProjects: b._count.projects,
      avgTrustScore: avgScore, completedProjects: completed, delayedProjects: delayed,
      onTimeRate: b._count.projects > 0 ? Math.round((completed / b._count.projects) * 100) : 0,
      projects: b.projects,
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${comparison.map((c) => c.name).join(" vs ")} — Builder Comparison`,
    description: `Compare builders: ${comparison.map((c) => c.name).join(", ")}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://rerapedia.com" },
        { "@type": "ListItem", position: 2, name: "Compare Builders", item: `https://rerapedia.com/compare/builders/${params.slugs}` },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-3xl font-bold text-gray-900">
        {comparison.map((c) => c.name).join(" vs ")}
      </h1>
      <p className="mt-2 text-gray-600">Side-by-side builder comparison based on RERA data and trust scores</p>

      {/* Score Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {comparison.map((b) => (
          <div key={b.slug} className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 text-center">
            <h2 className="text-xl font-bold text-gray-900">{b.name}</h2>
            <div className="mt-3">
              <TrustScoreBadge score={b.avgTrustScore} size="lg" />
            </div>
            <p className="mt-1 text-sm text-gray-500">Average Trust Score</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-gray-50 p-2">
                <p className="text-lg font-bold">{b.totalProjects}</p>
                <p className="text-xs text-gray-500">Total Projects</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="text-lg font-bold text-green-600">{b.onTimeRate}%</p>
                <p className="text-xs text-gray-500">On-Time Rate</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="text-lg font-bold text-green-600">{b.completedProjects}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="rounded bg-gray-50 p-2">
                <p className="text-lg font-bold text-red-600">{b.delayedProjects}</p>
                <p className="text-xs text-gray-500">Delayed</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ComparisonCharts data={comparison} />
    </div>
  );
}
