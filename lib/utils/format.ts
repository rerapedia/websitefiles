/**
 * Display formatting utilities.
 * All monetary values stored as paise — convert only here at display layer.
 */

export function formatPaise(paise: number | bigint | null | undefined): string {
  if (paise == null) return "Price on Request";
  const num = typeof paise === "bigint" ? Number(paise) : paise;
  const rupees = num / 100;

  if (rupees >= 10000000) {
    const cr = rupees / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (rupees >= 100000) {
    const lakh = rupees / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`;
  }
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function formatPriceRange(
  minPaise: number | bigint | null | undefined,
  maxPaise: number | bigint | null | undefined,
): string {
  if (minPaise == null && maxPaise == null) return "Price on Request";
  if (minPaise != null && maxPaise != null) {
    return `${formatPaise(minPaise)} - ${formatPaise(maxPaise)}`;
  }
  return formatPaise(minPaise ?? maxPaise);
}

export type TrustScoreInfo = {
  value: number;
  color: string;
  bgColor: string;
  label: string;
};

export function formatTrustScore(score: number | null | undefined): TrustScoreInfo {
  const value = score ?? 0;
  if (value >= 70) {
    return { value, color: "text-trust-green", bgColor: "bg-trust-green", label: "Reliable" };
  }
  if (value >= 50) {
    return { value, color: "text-trust-yellow", bgColor: "bg-trust-yellow", label: "Average" };
  }
  return { value, color: "text-trust-red", bgColor: "bg-trust-red", label: "Concerning" };
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatArea(sqft: number | null | undefined): string {
  if (sqft == null) return "N/A";
  return `${sqft.toLocaleString("en-IN")} sq.ft.`;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    REGISTERED: "Registered",
    UNDER_CONSTRUCTION: "Under Construction",
    COMPLETED: "Completed",
    LAPSED: "Lapsed",
    REVOKED: "Revoked",
    EXTENDED: "Extended",
  };
  return map[status] ?? status;
}

/** Convert Prisma Decimal to number safely */
export function toNum(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") return val;
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "object" && "toNumber" in val) {
    return (val as { toNumber(): number }).toNumber();
  }
  const n = Number(val);
  return isNaN(n) ? null : n;
}
