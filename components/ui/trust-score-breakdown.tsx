const DIMENSIONS = [
  { key: "delivery", label: "Delivery Track Record", max: 25 },
  { key: "documents", label: "Document Compliance", max: 15 },
  { key: "legalRisk", label: "Legal Risk", max: 15 },
  { key: "financial", label: "Financial Transparency", max: 10 },
  { key: "registration", label: "Registration Quality", max: 10 },
  { key: "builderHistory", label: "Builder History", max: 10 },
  { key: "neighbourhood", label: "Neighbourhood Quality", max: 10 },
  { key: "marketConfidence", label: "Market Confidence", max: 5 },
] as const;

export function TrustScoreBreakdown({
  scores,
}: {
  scores: Record<string, number> | null;
}) {
  if (!scores) return null;

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dim) => {
        const value = scores[dim.key] ?? 0;
        const pct = Math.min((value / dim.max) * 100, 100);
        const gradientClass =
          pct >= 70
            ? "bg-gradient-to-r from-trust-green to-trust-green-light"
            : pct >= 50
              ? "bg-gradient-to-r from-trust-yellow to-trust-yellow-light"
              : "bg-gradient-to-r from-trust-red to-trust-red-light";
        return (
          <div key={dim.key}>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-800">{dim.label}</span>
              <span className="font-semibold tabular-nums text-gray-900">
                {value}/{dim.max}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-gray-100">
              <div
                className={`h-2.5 rounded-full ${gradientClass}`}
                style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
