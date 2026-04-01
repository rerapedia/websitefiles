import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProjectBySlug } from "@/lib/db/queries";
import { formatPriceRange, formatDate, formatArea, formatStatus } from "@/lib/utils/format";
import { TrustScoreBadge } from "@/components/ui/trust-score-badge";
import { TrustScoreBreakdown } from "@/components/ui/trust-score-breakdown";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LeadCaptureForm } from "@/components/ui/lead-capture-form";
import { JsonLd, generateProductJsonLd, generateFaqJsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { AdSidebar } from "@/components/ads/ad-sidebar";
import { AdNative } from "@/components/ads/ad-native";
import { generateProjectSummary } from "@/lib/ai/project-summary";
import { Sparkles } from "lucide-react";

function AiProjectSummary({ project, state, builder, complaints, timeline }: {
  project: Record<string, unknown>;
  state: { name: string };
  builder: { name: string } | null;
  complaints: Array<{ id: string }>;
  timeline: Array<{ id: string }>;
}) {
  const summary = generateProjectSummary({
    name: project.name as string,
    reraNumber: project.reraRegNumber as string,
    builderName: builder?.name ?? null,
    city: project.city as string | null,
    locality: project.locality as string | null,
    state: state.name,
    status: project.status as string,
    type: project.type as string ?? "RESIDENTIAL",
    trustScore: project.trustScore as number | null,
    totalUnits: project.totalUnits as number | null,
    completionPercentage: project.completionPercentage as number | null,
    possessionDate: project.possessionDateOriginal as Date | null,
    registrationDate: project.reraRegistrationDate as Date | null,
    expiryDate: project.reraExpiryDate as Date | null,
    complaintCount: complaints.length,
    timelineEventCount: timeline.length,
  });

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] border border-blue-100">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-light">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">AI Project Analysis</h2>
        <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-medium text-brand-primary">AUTO-GENERATED</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">{summary}</p>
      <p className="mt-3 text-[10px] text-gray-400">This summary is auto-generated from public RERA data. Not financial advice.</p>
    </div>
  );
}

type Props = {
  params: Promise<{ stateSlug: string; projectSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);
  if (!project) return { title: "Project Not Found" };

  const title = (project.seoTitle as string) ?? `${project.name} - RERA Status & Trust Score`;
  const description = (project.seoDescription as string) ??
    `Check ${project.name} RERA registration status, trust score, timeline, and complaints.`;
  const url = `/project/${(project.state as { slug: string }).slug}/${project.slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { projectSlug } = await params;
  const project = await getProjectBySlug(projectSlug);
  if (!project) notFound();

  const t = await getTranslations("project");
  const state = project.state as { name: string; slug: string };
  const builder = project.builder as { name: string; slug: string } | null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: state.name, url: `/search?state=${state.slug}` },
    { name: project.name as string, url: `/project/${state.slug}/${project.slug}` },
  ];

  const faqs = (project.faqs as Array<{ question: string; answer: string }>) ?? [];
  const timeline = (project.timeline as Array<{
    id: string; eventType: string; oldValue: string | null;
    newValue: string | null; description: string | null; detectedAt: Date;
  }>) ?? [];

  const jsonLdData = [
    generateBreadcrumbJsonLd(breadcrumbs),
    generateProductJsonLd({
      name: project.name as string,
      slug: project.slug as string,
      stateSlug: state.slug,
      trustScore: project.trustScore as number | null,
    }),
    ...(faqs.length > 0 ? [generateFaqJsonLd(faqs)] : []),
  ];

  return (
    <>
      <JsonLd data={jsonLdData} />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumb items={breadcrumbs.map((b) => ({ label: b.name, href: b.url }))} />

        {/* Header — Gradient Banner */}
        <div className="mt-6 rounded-2xl p-6 text-white md:p-8" style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white md:text-3xl">
                {project.name as string}
              </h1>
              {builder && (
                <p className="mt-1 text-blue-100">
                  {t("builder")}:{" "}
                  <Link href={`/builder/${builder.slug}`} className="text-white underline decoration-blue-300 hover:decoration-white">
                    {builder.name}
                  </Link>
                </p>
              )}
              <p className="mt-1 text-sm text-blue-200">
                {[project.locality, project.city, state.name].filter(Boolean).join(", ")}
              </p>
            </div>
            <TrustScoreBadge score={project.trustScore as number | null} size="lg" />
          </div>
        </div>

        {/* AI Summary */}
        <AiProjectSummary project={project} state={state} builder={builder} complaints={project.complaints as Array<{id: string}>} timeline={timeline} />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Details */}
            <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  [t("reraNumber"), project.reraRegNumber],
                  [t("status"), formatStatus(project.status as string)],
                  [t("projectType"), project.type],
                  [t("totalUnits"), project.totalUnits != null ? String(project.totalUnits) : "N/A"],
                  [t("carpetArea"), project.carpetAreaMin != null
                    ? `${formatArea(project.carpetAreaMin as number)} - ${formatArea(project.carpetAreaMax as number)}`
                    : "N/A"],
                  [t("priceRange"), formatPriceRange(project.priceMinPaise as number | null, project.priceMaxPaise as number | null)],
                  [t("possessionDate"), formatDate(project.possessionDateOriginal as Date | null)],
                  [t("possessionRevised"), project.possessionDateRevised ? formatDate(project.possessionDateRevised as Date) : null],
                  [t("registrationDate"), formatDate(project.reraRegistrationDate as Date | null)],
                  [t("expiryDate"), formatDate(project.reraExpiryDate as Date | null)],
                  [t("completion"), project.completionPercentage != null ? `${project.completionPercentage}%` : "N/A"],
                ].filter(([, v]) => v != null).map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-sm text-gray-500">{label}</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Trust Score Breakdown */}
            {project.trustScoreJson && (
              <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
                <h2 className="text-lg font-semibold text-gray-900">{t("trustScore")} Breakdown</h2>
                <div className="mt-4">
                  <TrustScoreBreakdown scores={project.trustScoreJson} />
                </div>
              </section>
            )}

            <AdNative />

            {/* Timeline */}
            <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <h2 className="text-lg font-semibold text-gray-900">{t("timeline")}</h2>
              {timeline.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {timeline.map((event) => (
                    <div key={event.id} className="flex gap-3 border-l-2 border-brand-primary/30 pl-4 transition-colors hover:border-brand-primary">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.eventType.replace(/_/g, " ")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
                        )}
                        {event.oldValue && event.newValue && (
                          <p className="text-xs text-gray-500">
                            {event.oldValue} &rarr; {event.newValue}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(event.detectedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">{t("noTimeline")}</p>
              )}
            </section>

            {/* FAQs */}
            {faqs.length > 0 && (
              <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
                <h2 className="text-lg font-semibold text-gray-900">{t("faqs")}</h2>
                <div className="mt-4 space-y-4">
                  {faqs.map((faq, i) => (
                    <details key={i} className="group rounded-xl p-3 transition-colors hover:bg-gray-50">
                      <summary className="cursor-pointer font-medium text-gray-900 hover:text-brand-primary">
                        {faq.question}
                      </summary>
                      <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeadCaptureForm
              projectId={project.id as string}
              sourceType="PROJECT_PAGE"
            />
            <AdSidebar />
            <div className="rounded-2xl bg-gray-100 p-4">
              <p className="text-xs text-gray-500">{t("disclaimer")}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
