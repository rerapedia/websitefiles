"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, TestTube, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const AUDIENCES = [
  { value: "ALL_LEADS", label: "All Leads (with email)", desc: "Everyone who submitted a lead form" },
  { value: "ALL_USERS", label: "All Registered Users", desc: "Every registered account" },
  { value: "BUYERS", label: "Buyers Only", desc: "Users with BUYER role" },
  { value: "BUILDERS", label: "Builders Only", desc: "Users with BUILDER role" },
  { value: "BROKERS", label: "Brokers Only", desc: "Users with BROKER role" },
  { value: "SUBSCRIBERS", label: "Active Subscribers", desc: "Paid subscription holders" },
];

const EMAIL_TEMPLATES = [
  { label: "Custom (write your own)", value: "" },
  { label: "New Feature Announcement", value: `<h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">🚀 New Feature Alert!</h2>
<p style="color:#4b5563;font-size:15px;">Hi {{name}},</p>
<p style="color:#4b5563;font-size:15px;">We've just launched a powerful new feature on ReraPedia:</p>
<div style="background:#f0f4ff;padding:16px;border-radius:10px;margin:16px 0;">
  <p style="margin:0;font-size:16px;font-weight:600;color:#0E4A8A;">[Feature Name]</p>
  <p style="margin:8px 0 0;color:#4b5563;font-size:14px;">[Feature description — what it does and how it helps]</p>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg,#0E4A8A,#378ADD);border-radius:10px;padding:12px 28px;"><a href="https://rerapedia.com" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Try It Now</a></td></tr></table>` },
  { label: "RERA Market Update", value: `<h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">📊 RERA Market Update</h2>
<p style="color:#4b5563;font-size:15px;">Hi {{name}},</p>
<p style="color:#4b5563;font-size:15px;">Here's this week's RERA market highlights:</p>
<ul style="color:#4b5563;font-size:14px;line-height:1.8;">
  <li>[Number] new projects registered this week</li>
  <li>[Number] projects with score changes</li>
  <li>[Number] new complaints filed</li>
  <li>Top performing locality: [Name]</li>
</ul>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg,#0E4A8A,#378ADD);border-radius:10px;padding:12px 28px;"><a href="https://rerapedia.com/search" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">Explore Latest Data</a></td></tr></table>` },
  { label: "Builder Outreach", value: `<h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">🏗️ Claim Your Builder Profile on ReraPedia</h2>
<p style="color:#4b5563;font-size:15px;">Hi {{name}},</p>
<p style="color:#4b5563;font-size:15px;">Your construction projects are already on ReraPedia with Trust Scores visible to thousands of home buyers.</p>
<p style="color:#4b5563;font-size:15px;"><strong>Claim your profile to:</strong></p>
<ul style="color:#4b5563;font-size:14px;line-height:1.8;">
  <li>✅ Manage your builder reputation</li>
  <li>✅ Access qualified buyer leads</li>
  <li>✅ Run targeted ad campaigns</li>
  <li>✅ Get "Verified Builder" badge</li>
</ul>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:linear-gradient(135deg,#0E4A8A,#378ADD);border-radius:10px;padding:12px 28px;"><a href="https://rerapedia.com/pricing" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">View Builder Plans</a></td></tr></table>` },
];

export default function EmailMarketingPage() {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [audience, setAudience] = useState("ALL_LEADS");
  const [testEmail, setTestEmail] = useState("rerapedia@gmail.com");
  const [showPreview, setShowPreview] = useState(false);
  const [audienceCounts, setAudienceCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [result, setResult] = useState<{ sent?: number; failed?: number; sentTo?: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/email-campaign")
      .then((r) => r.json())
      .then((d) => { if (d.success) setAudienceCounts(d.data); })
      .catch(() => {});
  }, []);

  function applyTemplate(value: string) {
    if (value) setBodyHtml(value);
  }

  async function handleSendTest() {
    if (!subject || !bodyHtml || !testEmail) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/email-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml, audience, testEmail, sendTest: true }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function handleSendCampaign() {
    if (!subject || !bodyHtml) return;
    if (!confirm(`Send this campaign to ${audienceCounts[audience] ?? 0} recipients? This cannot be undone.`)) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/email-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyHtml, audience }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-light">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-sm text-gray-600">Create and send email campaigns to leads, users, and subscribers</p>
        </div>
      </div>

      {/* Result Banner */}
      {status === "sent" && result && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5" />
          {result.sentTo
            ? `Test email sent to ${result.sentTo}`
            : `Campaign sent: ${result.sent} delivered, ${result.failed} failed`
          }
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" /> Failed to send. Check server logs.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Campaign Builder */}
        <div className="lg:col-span-2 space-y-5">
          {/* Subject */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <label className="block text-sm font-medium text-gray-700">Email Subject *</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., New RERA Projects Added This Week" className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
          </div>

          {/* Template Selector */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <label className="block text-sm font-medium text-gray-700">Start from Template</label>
            <select onChange={(e) => applyTemplate(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
              {EMAIL_TEMPLATES.map((t, i) => (
                <option key={i} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Body Editor */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Email Body (HTML) *</label>
              <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200">
                {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPreview ? "Editor" : "Preview"}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">Use {"{{name}}"} to personalize with recipient name</p>

            {showPreview ? (
              <div className="mt-2 min-h-[300px] rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div dangerouslySetInnerHTML={{ __html: bodyHtml.replace(/\{\{name\}\}/g, "John") || '<p style="color:#999;">Write content to preview...</p>' }} />
              </div>
            ) : (
              <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={14} placeholder='<h2>Your heading</h2><p>Hi {{name}}, ...</p>' className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm shadow-sm focus:border-brand-primary focus:outline-none" />
            )}
          </div>
        </div>

        {/* Sidebar: Audience + Actions */}
        <div className="space-y-5">
          {/* Audience */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              <h2 className="font-semibold text-gray-900">Audience</h2>
            </div>
            <div className="mt-4 space-y-2">
              {AUDIENCES.map((a) => (
                <label key={a.value} className={`flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors ${audience === a.value ? "bg-brand-50 ring-2 ring-brand-primary" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="audience" value={a.value} checked={audience === a.value} onChange={(e) => setAudience(e.target.value)} className="h-4 w-4 text-brand-primary" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.label}</p>
                      <p className="text-[10px] text-gray-500">{a.desc}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-primary shadow-sm">
                    {audienceCounts[a.value] ?? 0}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <h2 className="font-semibold text-gray-900">Send</h2>

            {/* Test email */}
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600">Test Email Address</label>
              <div className="mt-1 flex gap-2">
                <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none" />
                <button onClick={handleSendTest} disabled={status === "sending" || !subject || !bodyHtml} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                  <TestTube className="h-3.5 w-3.5" /> Test
                </button>
              </div>
            </div>

            {/* Send campaign */}
            <button
              onClick={handleSendCampaign}
              disabled={status === "sending" || !subject || !bodyHtml}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-light py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending..." : `Send to ${audienceCounts[audience] ?? 0} Recipients`}
            </button>
            <p className="mt-2 text-[10px] text-gray-400 text-center">Gmail limit: ~500 emails/day. Sends are rate-limited at 10/sec.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
