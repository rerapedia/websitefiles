"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimForm({ builderSlug, builderName }: { builderSlug: string; builderName: string }) {
  const router = useRouter();
  const [gstin, setGstin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
      setErrorMsg("Please enter a valid 15-character GSTIN");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/builders/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin, builderSlug }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setTimeout(() => router.push(`/builder/${builderSlug}`), 2000);
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">Profile claimed successfully! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-xl font-semibold">Claim {builderName}</h2>
      <p className="mt-2 text-sm text-gray-600">
        Enter your GSTIN to verify your identity. This is the only ID we store.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">GSTIN Number</label>
          <input
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
            placeholder="22AAAAA0000A1Z5"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 font-mono text-sm uppercase tracking-wide focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            maxLength={15}
          />
          {errorMsg && <p className="mt-1 text-xs text-red-600">{errorMsg}</p>}
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "loading" ? "Verifying..." : "Verify & Claim Profile"}
        </button>
      </form>
    </div>
  );
}
