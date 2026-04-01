import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { formatPaise, toNum } from "@/lib/utils/format";
import { ProjectCard } from "@/components/ui/project-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { AdSidebar } from "@/components/ads/ad-sidebar";

type Props = { params: Promise<{ stateSlug: string; citySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stateSlug, citySlug } = await params;
  const state = await prisma.state.findFirst({ where: { slug: stateSlug } });
  const city = citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (!state) return { title: "Not Found" };

  const title = `RERA Projects in ${city}, ${state.name} - Trust Scores & Reviews`;
  const description = `Browse all RERA registered projects in ${city}, ${state.name}. Compare trust scores, check construction progress, and verify builders.`;
  const url = `/locality/${stateSlug}/${citySlug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function LocalityPage({ params }: Props) {
  const { stateSlug, citySlug } = await params;
  const state = await prisma.state.findFirst({ where: { slug: stateSlug } });
  if (!state) notFound();

  const city = citySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const projects = await prisma.project.findMany({
    where: {
      stateId: state.id,
      city: { contains: city, mode: "insensitive" },
      deletedAt: null,
    },
    include: { state: true, builder: true },
    orderBy: { trustScore: "desc" },
  });

  // Aggregate stats
  const scores = projects.map((p) => toNum(p.trustScore)).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const prices = projects
    .map((p) => p.priceMinPaise != null ? Number(p.priceMinPaise) : null)
    .filter((p): p is number => p !== null);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrices = projects
    .map((p) => p.priceMaxPaise != null ? Number(p.priceMaxPaise) : null)
    .filter((p): p is number => p !== null);
  const maxPrice = maxPrices.length > 0 ? Math.max(...maxPrices) : null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: state.name, url: `/state/${state.slug}` },
    { name: city, url: `/locality/${stateSlug}/${citySlug}` },
  ];

  return (
    <>
      <JsonLd data={[generateBreadcrumbJsonLd(breadcrumbs)]} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

        <h1 className="mt-6 text-2xl font-bold text-gray-900 md:text-3xl">
          RERA Projects in {city}, {state.name}
        </h1>
        <p className="mt-2 text-gray-600">
          {projects.length} registered projects found
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-brand-primary">{projects.length}</p>
            <p className="text-sm text-gray-600">Projects</p>
          </div>
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-brand-primary">{avgScore ?? "—"}</p>
            <p className="text-sm text-gray-600">Avg Trust Score</p>
          </div>
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-brand-primary">
              {minPrice && maxPrice ? `${formatPaise(minPrice)} - ${formatPaise(maxPrice)}` : "—"}
            </p>
            <p className="text-sm text-gray-600">Price Range</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  name={p.name}
                  slug={p.slug}
                  stateSlug={p.state.slug}
                  builderName={p.builder?.name ?? null}
                  city={p.city}
                  locality={p.locality}
                  status={p.status}
                  trustScore={toNum(p.trustScore)}
                  priceMinPaise={p.priceMinPaise != null ? Number(p.priceMinPaise) : null}
                  priceMaxPaise={p.priceMaxPaise != null ? Number(p.priceMaxPaise) : null}
                />
              ))}
            </div>
            {projects.length === 0 && (
              <p className="mt-4 text-gray-500">No projects found in this locality.</p>
            )}
          </div>

          <aside className="space-y-6">
            <AdSidebar />
          </aside>
        </div>
      </div>
    </>
  );
}
