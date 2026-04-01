"use client";

import { useState } from "react";

export function AdApprovalActions({ creativeId }: { creativeId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleAction(action: "approve" | "reject") {
    setStatus("loading");
    try {
      await fetch("/api/ads/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creativeId, action }),
      });
      setStatus("done");
      window.location.reload();
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") return <span className="text-sm text-green-600">Done</span>;

  return (
    <div className="flex gap-2">
      <button onClick={() => handleAction("approve")} disabled={status === "loading"} className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
        Approve
      </button>
      <button onClick={() => handleAction("reject")} disabled={status === "loading"} className="rounded border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
        Reject
      </button>
    </div>
  );
}
