/**
 * Estimate reading time from HTML content.
 * Average reading speed: 200 words per minute.
 */
export function estimateReadingTime(html: string | null | undefined): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Category → gradient color mapping */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  guides: "from-blue-600 to-blue-400",
  rankings: "from-emerald-600 to-emerald-400",
  analysis: "from-purple-600 to-purple-400",
  news: "from-amber-600 to-amber-400",
  tutorials: "from-cyan-600 to-cyan-400",
  reviews: "from-rose-600 to-rose-400",
};

export function getCategoryGradient(category: string | null | undefined): string {
  if (!category) return "from-slate-600 to-slate-400";
  return CATEGORY_GRADIENTS[category.toLowerCase()] ?? "from-slate-600 to-slate-400";
}

export function getCategoryColor(category: string | null | undefined): string {
  const map: Record<string, string> = {
    guides: "bg-blue-100 text-blue-700",
    rankings: "bg-emerald-100 text-emerald-700",
    analysis: "bg-purple-100 text-purple-700",
    news: "bg-amber-100 text-amber-700",
    tutorials: "bg-cyan-100 text-cyan-700",
    reviews: "bg-rose-100 text-rose-700",
  };
  if (!category) return "bg-gray-100 text-gray-700";
  return map[category.toLowerCase()] ?? "bg-gray-100 text-gray-700";
}
