"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const ROLES = [
  { value: "BUYER", label: "I'm looking to buy property" },
  { value: "BUILDER", label: "I'm a builder/developer" },
  { value: "BROKER", label: "I'm a real estate broker" },
] as const;

export function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presetRole = searchParams.get("role") ?? "BUYER";
  const claimSlug = searchParams.get("claim") ?? "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: presetRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        const verifyUrl = `/auth/verify?email=${encodeURIComponent(form.email)}${claimSlug ? `&claim=${claimSlug}` : ""}`;
        router.push(verifyUrl);
      } else {
        setError(data.error ?? "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            minLength={2}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
          <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
        </div>

        {/* Role selector */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">I am a...</legend>
          <div className="mt-2 space-y-2">
            {ROLES.map((role) => (
              <label
                key={role.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  form.role === role.value
                    ? "border-brand-primary bg-blue-50 text-brand-primary"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={form.role === role.value}
                  onChange={(e) => update("role", e.target.value)}
                  className="sr-only"
                />
                <span className={`h-4 w-4 rounded-full border-2 ${
                  form.role === role.value ? "border-brand-primary bg-brand-primary" : "border-gray-300"
                }`} />
                {role.label}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-primary hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}
