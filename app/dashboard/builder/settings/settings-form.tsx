"use client";

import { useState } from "react";

export function SettingsForm({
  description,
  website,
  phone,
  email,
  logoUrl,
}: {
  description: string;
  website: string;
  phone: string;
  email: string;
  logoUrl: string;
}) {
  const [form, setForm] = useState({ description, website, phone, email, logoUrl });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/builder/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.success ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Website</label>
        <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Logo URL</label>
        <input type="url" value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none" />
      </div>
      <button type="submit" disabled={status === "saving"} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {status === "saving" ? "Saving..." : "Save Changes"}
      </button>
      {status === "saved" && <p className="text-sm text-green-600">Profile updated successfully!</p>}
      {status === "error" && <p className="text-sm text-red-600">Failed to save. Please try again.</p>}
    </form>
  );
}
