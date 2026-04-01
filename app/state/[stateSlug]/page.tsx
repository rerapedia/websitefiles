import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { toNum } from "@/lib/utils/format";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { JsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { Building2, MapPin } from "lucide-react";

type Props = { params: Promise<{ stateSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug } = await params;
  const state = await prisma.state.findFirst({ where: { slug: stateSlug } });
  if (!state) return { title: "Not Found" };

  const title = `${state.name} RERA - Registered Projects, Builders & Trust Scores`;
  const description = `Browse all RERA registered projects in ${state.name}. Check builder trust scores, track construction, and verify compliance.`;
  return {
    title,
    description,
    alternates: { canonical: `/state/${stateSlug}` },
    openGraph: { title, description, url: `/state/${stateSlug}`, type: "website" },
  };
}

export default async function StateHubPage({ params }: Props) {
  const { stateSlug } = await params;
  const state = await prisma.state.findFirst({ where: { slug: stateSlug } });
  if (!state) notFound();

  // Get project stats by district/city
  const projects = await prisma.project.findMany({
    where: { stateId: state.id, deletedAt: null },
    select: { city: true, district: true, trustScore: true, builderId: true },
  });

  // Group by city
  const cityMap = new Map<string, { count: number; scores: number[] }>();
  for (const p of projects) {
    const city = p.city ?? p.district ?? "Other";
    const entry = cityMap.get(city) ?? { count: 0, scores: [] };
    entry.count++;
    const score = toNum(p.trustScore);
    if (score !== null) entry.scores.push(score);
    cityMap.set(city, entry);
  }

  const cities = Array.from(cityMap.entries())
    .map(([name, data]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      count: data.count,
      avgScore: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : null,
    }))
    .sort((a, b) => b.count - a.count);

  // Top builders in state
  const topBuilders = await prisma.builder.findMany({
    where: {
      deletedAt: null,
      projects: { some: { stateId: state.id, deletedAt: null } },
    },
    orderBy: { totalProjects: "desc" },
    take: 10,
  });

  const totalProjects = projects.length;
  const uniqueBuilders = new Set(projects.map((p) => p.builderId).filter(Boolean)).size;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: state.name, url: `/state/${stateSlug}` },
  ];

  return (
    <>
      <JsonLd data={[generateBreadcrumbJsonLd(breadcrumbs)]} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

        <h1 className="mt-6 text-2xl font-bold text-gray-900 md:text-3xl">
          {state.name} RERA — Registered Projects & Builders
        </h1>

        {state.reraWebsiteUrl && (
          <p className="mt-2 text-sm text-gray-500">
            Official portal:{" "}
            <a href={state.reraWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
              {state.reraWebsiteUrl}
            </a>
          </p>
        )}

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-3xl font-bold text-brand-primary">{totalProjects}</p>
            <p className="text-sm text-gray-600">Registered Projects</p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-3xl font-bold text-brand-primary">{uniqueBuilders}</p>
            <p className="text-sm text-gray-600">Builders</p>
          </div>
          <div className="rounded-2xl bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <p className="text-3xl font-bold text-brand-primary">{cities.length}</p>
            <p className="text-sm text-gray-600">Cities / Districts</p>
          </div>
        </div>

        {/* Cities */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">
            <MapPin className="mr-2 inline h-5 w-5" />
            Browse by City
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/locality/${stateSlug}/${city.slug}`}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{city.name}</h3>
                  <p className="text-sm text-gray-600">{city.count} projects</p>
                </div>
                {city.avgScore !== null && (
                  <TrustScoreBadge score={city.avgScore} size="sm" />
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Top builders */}
        {topBuilders.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              <Building2 className="mr-2 inline h-5 w-5" />
              Top Builders in {state.name}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topBuilders.map((builder) => (
                <Link
                  key={builder.id}
                  href={`/builder/${builder.slug}`}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{builder.name}</h3>
                    <p className="text-sm text-gray-600">{builder.totalProjects} projects</p>
                  </div>
                  <TrustScoreBadge score={toNum(builder.avgTrustScore)} size="sm" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
