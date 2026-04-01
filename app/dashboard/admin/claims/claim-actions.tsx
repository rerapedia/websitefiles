"use client";

import { useState } from "react";

export function ClaimActions({ builderId }: { builderId: string }) {
  const [status, setStatus] = useState<"idle" | "verified" | "rejected">("idle");

  if (status !== "idle") {
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${status === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {status === "verified" ? "Verified" : "Rejected"}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setStatus("verified")}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
      >
        Verify
      </button>
      <button
        onClick={() => setStatus("rejected")}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Reject
      </button>
    </div>
  );
}
