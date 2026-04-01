"use client";

interface TrustScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm:  { box: 48, r: 18, stroke: 4, fontSize: "text-sm",  labelSize: "text-[9px]" },
  md:  { box: 80, r: 32, stroke: 5, fontSize: "text-xl",  labelSize: "text-[10px]" },
  lg:  { box: 112, r: 46, stroke: 6, fontSize: "text-3xl", labelSize: "text-xs" },
};

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Excellent", from: "#16a34a", to: "#22c55e" };
  if (score >= 60) return { label: "Reliable",  from: "#16a34a", to: "#22c55e" };
  if (score >= 45) return { label: "Average",   from: "#ca8a04", to: "#eab308" };
  if (score >= 30) return { label: "Concerning", from: "#dc2626", to: "#ef4444" };
  return { label: "High Risk", from: "#dc2626", to: "#ef4444" };
}

export function TrustScoreBadge({ score, size = "md" }: TrustScoreBadgeProps) {
  const s = score ?? 0;
  const cfg = SIZES[size];
  const config = getScoreConfig(s);
  const circumference = 2 * Math.PI * cfg.r;
  const offset = circumference * (1 - s / 100);
  const gradientId = `score-grad-${size}-${Math.round(s)}`;

  if (score === null || score === undefined) {
    return (
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center rounded-full bg-gray-100 ${size === "sm" ? "h-12 w-12" : size === "lg" ? "h-28 w-28" : "h-20 w-20"}`}>
          <span className={`font-bold text-gray-400 ${cfg.fontSize}`}>—</span>
        </div>
        <span className={`mt-1 font-semibold tracking-wide text-gray-400 uppercase ${cfg.labelSize}`}>N/A</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
        <svg
          width={cfg.box}
          height={cfg.box}
          viewBox={`0 0 ${cfg.box} ${cfg.box}`}
          className="-rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={config.from} />
              <stop offset="100%" stopColor={config.to} />
            </linearGradient>
          </defs>
          <circle
            cx={cfg.box / 2}
            cy={cfg.box / 2}
            r={cfg.r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={cfg.stroke}
          />
          <circle
            cx={cfg.box / 2}
            cy={cfg.box / 2}
            r={cfg.r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-extrabold text-gray-900 ${cfg.fontSize}`}>{s}</span>
        </div>
      </div>
      <span
        className={`mt-1 font-semibold tracking-wide uppercase ${cfg.labelSize}`}
        style={{ color: config.from }}
      >
        {config.label}
      </span>
    </div>
  );
}
