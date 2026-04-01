"use client";

import { useState } from "react";

const ALERT_TYPES = [
  { value: "SCORE_DROP", label: "Trust Score Drops", desc: "When a project's score decreases" },
  { value: "DEADLINE_EXTENSION", label: "Deadline Extensions", desc: "When possession dates change" },
  { value: "NEW_COMPLAINT", label: "New Complaints", desc: "When complaints are filed against a project" },
  { value: "STATUS_CHANGE", label: "Status Changes", desc: "Registration, completion, or expiry changes" },
  { value: "NEW_DOCUMENT", label: "New Documents", desc: "When RERA documents are uploaded" },
  { value: "PRICE_CHANGE", label: "Price Changes", desc: "When listed pricing is updated" },
];

export default function AlertsConfigPage() {
  const [selected, setSelected] = useState<string[]>(["SCORE_DROP", "DEADLINE_EXTENSION", "STATUS_CHANGE"]);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/investor/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertTypes: selected,
          deliveryEmail: emailEnabled,
          deliveryDashboard: true,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Alert Settings</h1>
      <p className="mt-1 text-sm text-gray-600">Configure notifications for your portfolio projects</p>

      <div className="mt-6 space-y-3">
        {ALERT_TYPES.map((type) => (
          <label key={type.value} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-4 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selected.includes(type.value)}
              onChange={() => toggle(type.value)}
              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <div>
              <p className="font-medium text-gray-900">{type.label}</p>
              <p className="text-sm text-gray-500">{type.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-4">
        <h3 className="font-semibold text-gray-900">Delivery Method</h3>
        <label className="mt-3 flex items-center gap-2">
          <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          <span className="text-sm">Email notifications</span>
        </label>
        <label className="mt-2 flex items-center gap-2">
          <input type="checkbox" checked disabled className="h-4 w-4 rounded border-gray-300" />
          <span className="text-sm">Dashboard notifications (always on)</span>
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {saved && <span className="text-sm text-green-600">Preferences saved!</span>}
      </div>
    </div>
  );
}
