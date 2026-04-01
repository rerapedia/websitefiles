"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const BUDGET_OPTIONS = [
  { value: "UNDER_25L", label: "Under ₹25 Lakh" },
  { value: "25L_50L", label: "₹25 Lakh - ₹50 Lakh" },
  { value: "50L_1CR", label: "₹50 Lakh - ₹1 Crore" },
  { value: "1CR_2CR", label: "₹1 Crore - ₹2 Crore" },
  { value: "2CR_5CR", label: "₹2 Crore - ₹5 Crore" },
  { value: "ABOVE_5CR", label: "Above ₹5 Crore" },
];

export function LeadCaptureForm({
  projectId,
  builderId,
  sourceType,
}: {
  projectId?: string;
  builderId?: string;
  sourceType: "PROJECT_PAGE" | "BUILDER_PAGE" | "SEARCH_PAGE";
}) {
  const t = useTranslations("leadForm");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = "Enter a valid 10-digit mobile number";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: name.trim(),
          buyerPhone: phone,
          buyerEmail: email || undefined,
          budgetRange: budget || undefined,
          projectId,
          builderId,
          sourceType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data?.duplicate ? "duplicate" : "success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] border border-green-100">
        <p className="font-medium text-green-800">
          {status === "success" ? t("success") : t("duplicate")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-900">{t("title")}</h3>
      <p className="mt-1 text-sm text-gray-600">{t("subtitle")}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm shadow-sm transition-shadow focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder={t("phonePlaceholder")}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm shadow-sm transition-shadow focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-sm shadow-sm transition-shadow focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm text-gray-700 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">Budget Range (optional)</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50"
        >
          {status === "loading" ? "..." : t("submit")}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{t("error")}</p>
      )}
    </div>
  );
}
