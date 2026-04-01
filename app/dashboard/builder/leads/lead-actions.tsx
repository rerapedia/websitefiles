"use client";

import { useState } from "react";

const STATUSES = [
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
] as const;

export function LeadActions({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await fetch("/api/builder/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      window.location.reload();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "CONVERTED" || currentStatus === "LOST") return null;

  return (
    <div className="flex gap-1">
      {STATUSES.filter((s) => s.value !== currentStatus).map((s) => (
        <button
          key={s.value}
          onClick={() => updateStatus(s.value)}
          disabled={loading}
          className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
