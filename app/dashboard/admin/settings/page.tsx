"use client";

import { useState } from "react";
import { Settings, Globe, CreditCard, Search, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "ReraPedia",
    siteUrl: "https://rerapedia.com",
    defaultMetaTitle: "ReraPedia - India's RERA Transparency Platform",
    defaultMetaDescription: "Check RERA project trust scores, verify builders, and make informed property decisions across Haryana, Delhi, UP, Maharashtra & Karnataka.",
    socialTwitter: "@rerapedia",
    socialLinkedin: "",
    adsenseId: "",
    razorpayMode: "live",
    scraperRateLimit: "2",
    scraperMaxPages: "100",
    maintenanceMode: false,
  });

  function update(field: string, value: string | boolean) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-600">Configure site-wide settings and integrations</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* General */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name</label>
              <input type="text" value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Site URL</label>
              <input type="url" value={settings.siteUrl} onChange={(e) => update("siteUrl", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Default Meta Title</label>
              <input type="text" value={settings.defaultMetaTitle} onChange={(e) => update("defaultMetaTitle", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Default Meta Description</label>
              <textarea value={settings.defaultMetaDescription} onChange={(e) => update("defaultMetaDescription", e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter/X Handle</label>
              <input type="text" value={settings.socialTwitter} onChange={(e) => update("socialTwitter", e.target.value)} placeholder="@gharscore" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
              <input type="url" value={settings.socialLinkedin} onChange={(e) => update("socialLinkedin", e.target.value)} placeholder="https://linkedin.com/company/gharscore" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Payment & Ads</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Google AdSense Publisher ID</label>
              <input type="text" value={settings.adsenseId} onChange={(e) => update("adsenseId", e.target.value)} placeholder="ca-pub-XXXXXXXXXX" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              <p className="mt-1 text-xs text-gray-400">Leave empty until AdSense is approved</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Razorpay Mode</label>
              <select value={settings.razorpayMode} onChange={(e) => update("razorpayMode", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
              <p className="mt-1 text-xs text-amber-600">{settings.razorpayMode === "live" ? "Live payments are active — real charges will be processed" : "Test mode — no real charges"}</p>
            </div>
          </div>
        </section>

        {/* Scraper Settings */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Scraper Configuration</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate Limit (req/sec)</label>
              <input type="number" value={settings.scraperRateLimit} onChange={(e) => update("scraperRateLimit", e.target.value)} min="1" max="10" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
              <p className="mt-1 text-xs text-gray-400">CLAUDE.md rule: max 2 req/s per portal</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Pages Per Scrape</label>
              <input type="number" value={settings.scraperMaxPages} onChange={(e) => update("scraperMaxPages", e.target.value)} min="10" max="1000" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Maintenance */}
        <section className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
          </div>
          <div className="mt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => update("maintenanceMode", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary"
              />
              <div>
                <p className="font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-sm text-gray-500">When enabled, shows a maintenance page to all visitors</p>
              </div>
            </label>
          </div>
        </section>

        {/* Save */}
        <div className="flex gap-3">
          <button className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110">
            Save Settings
          </button>
          <button className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
