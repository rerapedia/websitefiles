import type { Metadata } from "next";
import { SearchResults } from "./search-results";

type Props = {
  searchParams: Promise<{ q?: string; state?: string; status?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search: ${q}` : "Search RERA Projects";
  const description = "Search 3,200+ RERA registered projects across Haryana, Delhi, UP, Maharashtra & Karnataka. Filter by state, city, trust score, and project status.";
  return {
    title,
    description,
    alternates: { canonical: "/search" },
    openGraph: { title, description, url: "/search", type: "website" },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Search RERA Projects</h1>
      <SearchResults
        initialQuery={params.q ?? ""}
        initialState={params.state ?? ""}
        initialStatus={params.status ?? ""}
      />
    </div>
  );
}
