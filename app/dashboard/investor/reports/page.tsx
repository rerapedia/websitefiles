"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ProjectReportPDF = dynamic(() => import("./report-pdf").then((m) => m.ProjectReportPDF), { ssr: false });

interface ReportData {
  project: {
    name: string;
    reraNumber: string;
    trustScore: number | null;
    status: string;
    city: string;
    locality: string;
    possessionDate: string | null;
    totalUnits: number | null;
    completionPercentage: number | null;
    registrationDate: string | null;
    expiryDate: string | null;
  };
  builder: { name: string; slug: string } | null;
  state: { name: string } | null;
  complaints: Array<{ id: string; subject: string | null; status: string }>;
  timeline: Array<{ changeDate: string; changeType: string; oldValue: string | null; newValue: string | null }>;
  generatedAt: string;
}

export default function ReportsPage() {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

  async function handleFetch() {
    if (!slug.trim()) return;
    setLoading(true);
    setShowPdf(false);
    try {
      const res = await fetch(`/api/investor/reports?project=${encodeURIComponent(slug.trim())}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        alert(result.error ?? "Project not found");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">PDF Reports</h1>
      <p className="mt-1 text-sm text-gray-600">Generate branded trust score reports for any project</p>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Enter project slug (e.g., the-camellias)"
          className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button onClick={handleFetch} disabled={loading} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {data && (
        <div className="mt-6">
          <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5">
            <h2 className="text-lg font-semibold">{data.project.name}</h2>
            <p className="text-sm text-gray-600">
              {data.builder?.name} | {data.project.city} | RERA: {data.project.reraNumber}
            </p>
            <p className="mt-2 text-sm">
              Trust Score: <span className="text-lg font-bold text-brand-primary">{data.project.trustScore ?? "N/A"}/100</span>
            </p>
            <p className="text-sm text-gray-500">
              Status: {data.project.status?.replace(/_/g, " ")} | Complaints: {data.complaints.length} | Timeline events: {data.timeline.length}
            </p>

            <button
              onClick={() => setShowPdf(true)}
              className="mt-4 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Download PDF Report
            </button>
          </div>

          {showPdf && <ProjectReportPDF data={data} />}
        </div>
      )}
    </div>
  );
}
