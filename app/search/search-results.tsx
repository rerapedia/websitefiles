"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/ui/project-card";
import { Search } from "lucide-react";

type SearchHit = {
  id: string;
  name: string;
  slug: string;
  stateSlug: string;
  builderName: string | null;
  city: string | null;
  locality: string | null;
  status: string;
  trustScore: number | null;
  priceMinPaise: number | null;
  priceMaxPaise: number | null;
};

const PAGE_SIZE = 60;

export function SearchResults({
  initialQuery,
  initialState,
  initialStatus,
}: {
  initialQuery: string;
  initialState: string;
  initialStatus: string;
}) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [stateFilter, setStateFilter] = useState(initialState);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (q: string, state: string, status: string, pageNum: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (state) params.set("state", state);
      if (status) params.set("status", status);
      params.set("page", String(pageNum));
      params.set("limit", String(PAGE_SIZE));

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const hits = data.data.hits ?? [];
        if (append) {
          setResults((prev) => [...prev, ...hits]);
        } else {
          setResults(hits);
        }
        setTotal(data.data.estimatedTotalHits ?? hits.length);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Search on mount and when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      doSearch(query, stateFilter, statusFilter, 1, false);
      // Update URL without navigation
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (stateFilter) params.set("state", stateFilter);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, stateFilter, statusFilter, doSearch, router]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, stateFilter, statusFilter, nextPage, true);
  }

  const hasMore = results.length < total;

  return (
    <div className="mt-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm transition-shadow focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:shadow-[0_0_20px_rgba(30,64,175,0.15)]"
          autoFocus
        />
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          <option value="">{t("allStates")}</option>
          <option value="haryana">Haryana</option>
          <option value="delhi">Delhi</option>
          <option value="uttar-pradesh">Uttar Pradesh</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="REGISTERED">Registered</option>
          <option value="UNDER_CONSTRUCTION">Under Construction</option>
          <option value="COMPLETED">Completed</option>
          <option value="LAPSED">Lapsed</option>
        </select>
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-gray-500">
        {loading ? "Searching..." : `Showing ${results.length} of ${total} ${t("results")}`}
      </p>

      {/* Skeleton loading */}
      {loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-6 w-1/3 rounded-full" />
                </div>
                <div className="skeleton h-12 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((hit) => (
              <ProjectCard
                key={hit.id}
                name={hit.name}
                slug={hit.slug}
                stateSlug={hit.stateSlug}
                builderName={hit.builderName}
                city={hit.city}
                locality={hit.locality}
                status={hit.status}
                trustScore={hit.trustScore}
                priceMinPaise={hit.priceMinPaise}
                priceMaxPaise={hit.priceMaxPaise}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-brand-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : `Load More (${total - results.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && results.length === 0 && (
        <p className="mt-8 text-center text-gray-500">{t("noResults")}</p>
      )}
    </div>
  );
}
