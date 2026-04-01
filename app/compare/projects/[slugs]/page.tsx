import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { formatDate } from "@/lib/utils/format";
import { ProjectComparisonCharts } from "./charts";

interface Props {
  params: { slugs: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugArr = params.slugs.split("-vs-").filter(Boolean);
  const projects = await prisma.project.findMany({
    where: { slug: { in: slugArr } },
    select: { name: true },
  });
  const names = projects.map((p) => p.name).join(" vs ");
  const url = `/compare/projects/${slugArr.join("-vs-")}`;
  return {
    title: `${names} — Project Comparison | ReraPedia`,
    description: `Compare ${names} side by side. Trust scores, completion status, complaints, RERA compliance, and more.`,
    alternates: { canonical: url },
    openGraph: { title: `${names} — Project Comparison`, description: `Compare ${names} trust scores.`, url },
  };
}

export default async function ProjectComparisonPage({ params }: Props) {
  const slugArr = params.slugs.split("-vs-").filter(Boolean);
  if (slugArr.length < 2) notFound();

  const projects = await prisma.project.findMany({
    where: { slug: { in: slugArr }, deletedAt: null },
    include: {
      builder: { select: { name: true, slug: true } },
      state: { select: { name: true } },
      complaints: { select: { id: true } },
    },
  });

  if (projects.length < 2) notFound();

  const comparison = projects.map((p) => ({
    name: p.name, slug: p.slug,
    builderName: p.builder?.name ?? "Unknown",
    trustScore: Number(p.trustScore ?? 0),
    status: p.status ?? "UNDER_CONSTRUCTION",
    totalUnits: p.totalUnits,
    completionPercentage: Number(p.completionPercentage ?? 0),
    possessionDate: p.possessionDateOriginal,
    reraNumber: p.reraRegNumber,
    city: p.city,
    complaintCount: p.complaints.length,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${comparison.map((c) => c.name).join(" vs ")} — Project Comparison`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://rerapedia.com" },
        { "@type": "ListItem", position: 2, name: "Compare Projects", item: `https://rerapedia.com/compare/projects/${params.slugs}` },
      ],
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-3xl font-bold text-gray-900">
        {comparison.map((c) => c.name).join(" vs ")}
      </h1>
      <p className="mt-2 text-gray-600">Compare RERA projects side by side</p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Metric</th>
              {comparison.map((p) => (
                <th key={p.slug} className="px-4 py-3">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-600">Trust Score</td>
              {comparison.map((p) => (
                <td key={p.slug} className="px-4 py-3"><TrustScoreBadge score={p.trustScore} /></td>
              ))}
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-600">Builder</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.builderName}</td>)}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-600">RERA Number</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3 font-mono text-xs">{p.reraNumber}</td>)}
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-600">Status</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.status.replace(/_/g, " ")}</td>)}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-600">City</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.city}</td>)}
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-600">Total Units</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.totalUnits ?? "—"}</td>)}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-600">Completion</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.completionPercentage != null ? `${p.completionPercentage}%` : "—"}</td>)}
            </tr>
            <tr className="border-b bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-600">Possession Date</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.possessionDate ? formatDate(p.possessionDate) : "—"}</td>)}
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium text-gray-600">Complaints</td>
              {comparison.map((p) => <td key={p.slug} className="px-4 py-3">{p.complaintCount}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <ProjectComparisonCharts data={comparison} />
    </div>
  );
}
