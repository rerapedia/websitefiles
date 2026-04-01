"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const claimSlug = searchParams.get("claim") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.success) {
        // Auto sign-in after verification
        const redirectUrl = claimSlug ? `/auth/claim/${claimSlug}` : "/";
        await signIn("credentials", { email, password: "", redirect: false });
        window.location.href = redirectUrl;
      } else {
        setError(data.error ?? "Invalid code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="text-center text-sm text-gray-600">
        Code sent to <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          autoFocus
        />
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
}
