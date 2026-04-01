import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getBuilderBySlug } from "@/lib/db/queries";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { ProjectCard } from "@/components/ui/project-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd, generateOrganizationJsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ builderSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { builderSlug } = await params;
  const builder = await getBuilderBySlug(builderSlug);
  if (!builder) return { title: "Builder Not Found" };

  const title = builder.seoTitle ?? `${builder.name} - RERA Projects & Trust Score`;
  const description = builder.seoDescription ??
    `View ${builder.name}'s RERA registered projects, trust scores, and compliance record.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `/builder/${builder.slug}`, type: "website" },
    alternates: { canonical: `/builder/${builder.slug}` },
  };
}

export default async function BuilderPage({ params }: Props) {
  const { builderSlug } = await params;
  const builder = await getBuilderBySlug(builderSlug);
  if (!builder) notFound();

  const t = await getTranslations("builder");

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Builders", url: "/search" },
    { name: builder.name as string, url: `/builder/${builder.slug}` },
  ];

  const projects = (builder.projects as Array<{
    name: string; slug: string; city: string | null; locality: string | null;
    status: string; trustScore: number | null; priceMinPaise: number | null;
    priceMaxPaise: number | null; state: { slug: string };
  }>) ?? [];

  const jsonLdData = [
    generateBreadcrumbJsonLd(breadcrumbs),
    generateOrganizationJsonLd({
      name: builder.name as string,
      slug: builder.slug as string,
      description: builder.description as string | null,
      website: builder.website as string | null,
      email: builder.email as string | null,
      phone: builder.phone as string | null,
    }),
  ];

  return (
    <>
      <JsonLd data={jsonLdData} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

        {/* Builder Header — Gradient Banner */}
        <div className="mt-6 rounded-2xl p-6 text-white md:p-8" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white md:text-3xl">
                {builder.name as string}
              </h1>
              {builder.description && (
                <p className="mt-2 text-blue-100">{builder.description as string}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {builder.website && (
                  <a
                    href={builder.website as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white underline decoration-blue-300 hover:decoration-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("website")}
                  </a>
                )}
                {builder.phone && (
                  <span className="text-blue-200">{t("contact")}: {builder.phone as string}</span>
                )}
              </div>
            </div>
            <div className="text-center">
              <TrustScoreBadge score={builder.avgTrustScore as number | null} size="lg" />
              <p className="mt-1 text-xs text-blue-200">{t("avgScore")}</p>
            </div>
          </div>
        </div>

        {/* Claim CTA */}
        {!(builder.isClaimed as boolean) && (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-primary/30 bg-gradient-to-br from-brand-50 to-blue-50 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-gray-900">{t("claimProfile")}</h2>
            <p className="mt-1 text-sm text-gray-600">{t("claimDescription")}</p>
            <a
              href={`/auth/register?role=BUILDER&claim=${builder.slug}`}
              className="mt-3 inline-block rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              {t("claimProfile")}
            </a>
          </div>
        )}

        {/* Projects */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900">
            {t("projects")} ({projects.length})
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                name={project.name}
                slug={project.slug}
                stateSlug={project.state.slug}
                city={project.city}
                locality={project.locality}
                status={project.status}
                trustScore={project.trustScore}
                priceMinPaise={project.priceMinPaise}
                priceMaxPaise={project.priceMaxPaise}
              />
            ))}
          </div>
          {projects.length === 0 && (
            <p className="mt-4 text-gray-500">No projects found for this builder.</p>
          )}
        </section>
      </div>
    </>
  );
}
