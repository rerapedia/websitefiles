import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getStats, getStates, getRecentProjects } from "@/lib/db/queries";
import { ProjectCard } from "@/components/ui/project-card";
import {
  Shield,
  FileText,
  Scale,
  Landmark,
  ClipboardCheck,
  Building2,
  MapPin,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const DIMENSION_ICONS = [Shield, FileText, Scale, Landmark, ClipboardCheck, Building2, MapPin, TrendingUp];
const DIMENSION_KEYS = [
  "delivery", "documents", "legalRisk", "financial",
  "registration", "builderHistory", "neighbourhood", "marketConfidence",
] as const;
const DIMENSION_WEIGHTS = ["25 pts", "15 pts", "15 pts", "10 pts", "10 pts", "10 pts", "10 pts", "5 pts"];

export default async function HomePage() {
  const t = await getTranslations();
  const [stats, states, recentProjects] = await Promise.all([
    getStats(),
    getStates(),
    getRecentProjects(6),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ReraPedia",
    url: siteUrl,
    description: "India's RERA transparency and intelligence platform. Search 3,200+ projects across 5 states.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ReraPedia",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "India's first RERA transparency platform. Aggregates public RERA data, scores projects on trustworthiness, and helps home buyers make informed decisions.",
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@rerapedia.com",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* Hero — Dark animated gradient */}
      <section
        className="relative overflow-hidden px-4 py-20 text-center md:py-32"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e40af 40%, #3b82f6 70%, #1e40af 100%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 8s ease infinite",
        }}
      >
        {/* Decorative dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:32px_32px]" />
        {/* Radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <h1 className="relative mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="relative mx-auto mt-4 max-w-2xl text-lg text-blue-100/80">
          {t("hero.subtitle")}
        </p>
        <form action="/search" className="relative mx-auto mt-8 max-w-xl">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder={t("hero.searchPlaceholder")}
              className="flex-1 rounded-xl border-0 bg-white/95 px-5 py-3.5 text-sm shadow-lg backdrop-blur-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-primary shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            >
              {t("common.search")}
            </button>
          </div>
        </form>
      </section>

      {/* Stats — Floating cards overlapping hero */}
      <section className="relative z-10 -mt-8 px-4 pb-16">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 md:gap-8">
          {[
            { value: stats.projectCount, label: t("stats.projects") },
            { value: stats.builderCount, label: t("stats.builders") },
            { value: stats.stateCount, label: t("stats.states") },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] md:p-6">
              <div className="text-3xl font-extrabold text-brand-primary md:text-4xl">
                {stat.value}+
              </div>
              <div className="mt-1 text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore by State */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            {t("exploreStates.title")}
          </h2>
          <p className="mt-2 text-center text-gray-600">{t("exploreStates.subtitle")}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {states.map((state) => (
              <Link
                key={state.id}
                href={`/state/${state.slug}`}
                className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light shadow-md">
                  <Landmark className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-brand-primary">{state.name} RERA</h3>
                  <p className="text-sm text-gray-500">Browse registered projects</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How Trust Scores Work */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            {t("trustScore.title")}
          </h2>
          <p className="mt-2 text-center text-gray-600">{t("trustScore.subtitle")}</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {DIMENSION_KEYS.map((key, i) => {
              const Icon = DIMENSION_ICONS[i];
              return (
                <div key={key} className="group rounded-xl bg-gray-50 p-5 transition-all duration-300 hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-brand-primary transition-transform duration-300 group-hover:scale-110" />
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-primary">{DIMENSION_WEIGHTS[i]}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 transition-colors group-hover:text-brand-primary">
                    {t(`trustScore.${key}`)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {t(`trustScore.${key}Desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recently Added Projects */}
      {recentProjects.length > 0 && (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{t("project.recentlyAdded")}</h2>
              <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-brand-primary transition-colors hover:text-brand-light">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  name={project.name as string}
                  slug={project.slug as string}
                  stateSlug={(project.state as { slug: string }).slug}
                  builderName={project.builder ? (project.builder as { name: string }).name : null}
                  city={project.city as string | null}
                  locality={project.locality as string | null}
                  status={project.status as string}
                  trustScore={project.trustScore as number | null}
                  priceMinPaise={project.priceMinPaise as number | null}
                  priceMaxPaise={project.priceMaxPaise as number | null}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
