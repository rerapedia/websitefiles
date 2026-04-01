"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AD_TYPES = [
  { value: "SEARCH_SPONSORED", label: "Sponsored Search Listing" },
  { value: "BANNER_728x90", label: "Header Banner (728x90)" },
  { value: "SIDEBAR_300x250", label: "Sidebar Rectangle (300x250)" },
  { value: "IN_CONTENT_NATIVE", label: "In-Content Native Ad" },
];

export function CampaignForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    campaignName: "",
    adType: "SEARCH_SPONSORED",
    budgetTotal: "",
    budgetDaily: "",
    cpcBid: "",
    targetCities: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 2: Creative
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [creative, setCreative] = useState({
    headline: "",
    description: "",
    ctaText: "Learn More",
    destinationUrl: "",
    imageUrl: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateCreative(field: string, value: string) {
    setCreative((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: form.campaignName,
          adType: form.adType,
          budgetTotalPaise: Math.round(parseFloat(form.budgetTotal || "0") * 100),
          budgetDailyPaise: form.budgetDaily ? Math.round(parseFloat(form.budgetDaily) * 100) : undefined,
          cpcBidPaise: form.cpcBid ? Math.round(parseFloat(form.cpcBid) * 100) : undefined,
          targetCities: form.targetCities ? form.targetCities.split(",").map((c) => c.trim()) : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaignId(data.data.id);
      } else {
        setError(data.error ?? "Failed to create campaign");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCreative(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignId) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/ads/creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creative, campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/builder/campaigns");
      } else {
        setError(data.error ?? "Failed to add creative");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!campaignId) {
    return (
      <form onSubmit={handleCreateCampaign} className="space-y-4">
        <h2 className="font-semibold text-gray-900">Step 1: Campaign Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
          <input type="text" value={form.campaignName} onChange={(e) => update("campaignName", e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ad Type</label>
          <select value={form.adType} onChange={(e) => update("adType", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm">
            {AD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Budget (₹)</label>
            <input type="number" value={form.budgetTotal} onChange={(e) => update("budgetTotal", e.target.value)} required min="1000" className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Budget (₹)</label>
            <input type="number" value={form.budgetDaily} onChange={(e) => update("budgetDaily", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPC Bid (₹)</label>
            <input type="number" value={form.cpcBid} onChange={(e) => update("cpcBid", e.target.value)} min="5" step="1" className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Target Cities (comma-separated)</label>
          <input type="text" value={form.targetCities} onChange={(e) => update("targetCities", e.target.value)} placeholder="Gurgaon, Noida, Delhi" className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Creating..." : "Next: Add Creative"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleAddCreative} className="space-y-4">
      <h2 className="font-semibold text-gray-900">Step 2: Upload Creative</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Headline (max 60 chars)</label>
        <input type="text" value={creative.headline} onChange={(e) => updateCreative("headline", e.target.value)} required maxLength={60} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        <p className="mt-0.5 text-xs text-gray-400">{creative.headline.length}/60</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description (max 120 chars)</label>
        <textarea value={creative.description} onChange={(e) => updateCreative("description", e.target.value)} required maxLength={120} rows={2} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        <p className="mt-0.5 text-xs text-gray-400">{creative.description.length}/120</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">CTA Text</label>
          <input type="text" value={creative.ctaText} onChange={(e) => updateCreative("ctaText", e.target.value)} maxLength={30} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input type="url" value={creative.imageUrl} onChange={(e) => updateCreative("imageUrl", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Destination URL</label>
        <input type="url" value={creative.destinationUrl} onChange={(e) => updateCreative("destinationUrl", e.target.value)} required className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {saving ? "Submitting..." : "Submit for Approval"}
      </button>
    </form>
  );
}
