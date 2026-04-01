import Link from "next/link";
import { TrustScoreBadge } from "./trust-score-badge";
import { formatPriceRange, formatStatus } from "@/lib/utils/format";

type ProjectCardProps = {
  name: string;
  slug: string;
  stateSlug: string;
  builderName?: string | null;
  city?: string | null;
  locality?: string | null;
  status: string;
  trustScore: number | null;
  priceMinPaise?: number | null;
  priceMaxPaise?: number | null;
};

export function ProjectCard({
  name,
  slug,
  stateSlug,
  builderName,
  city,
  locality,
  status,
  trustScore,
  priceMinPaise,
  priceMaxPaise,
}: ProjectCardProps) {
  return (
    <Link
      href={`/project/${stateSlug}/${slug}`}
      className="group relative block overflow-hidden rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]"
    >
      {/* Gradient accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary to-brand-light opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900 transition-colors duration-200 group-hover:text-brand-primary">
            {name}
          </h3>
          {builderName && (
            <p className="mt-1 truncate text-sm text-gray-600">{builderName}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {[locality, city].filter(Boolean).join(", ")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
              {formatStatus(status)}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {formatPriceRange(priceMinPaise, priceMaxPaise)}
            </span>
          </div>
        </div>
        <TrustScoreBadge score={trustScore} size="sm" />
      </div>
    </Link>
  );
}
