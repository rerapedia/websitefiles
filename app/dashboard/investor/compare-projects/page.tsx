"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProjectComparison {
  name: string;
  slug: string;
  builderName: string;
  city: string;
  trustScore: number;
  status: string;
  reraNumber: string;
  possessionDate: string | null;
  totalUnits: number | null;
  completionPercentage: number | null;
  complaintCount: number;
  recentChanges: number;
}

export default function CompareProjectsDashboard() {
  const [slugInput, setSlugInput] = useState("");
  const [projects, setProjects] = useState<ProjectComparison[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    const slugs = slugInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length < 2) {
      alert("Enter at least 2 project slugs separated by commas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/investor/compare?type=projects&slugs=${slugs.join(",")}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data.items);
      }
    } catch {
      alert("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Compare Projects</h1>
      <p className="mt-1 text-sm text-gray-600">Compare trust scores and key metrics side by side</p>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="Enter project slugs: the-camellias, dlf-privana-south"
          className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button onClick={handleCompare} disabled={loading} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {projects.length > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Trust Score Comparison</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="trustScore" fill="#2563eb" name="Trust Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">Project</th>
                  <th className="px-3 py-3">Builder</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Units</th>
                  <th className="px-3 py-3">Completion</th>
                  <th className="px-3 py-3">Complaints</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.slug} className="border-b">
                    <td className="px-3 py-3">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.reraNumber}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{p.builderName}</td>
                    <td className="px-3 py-3 font-semibold text-brand-primary">{p.trustScore}</td>
                    <td className="px-3 py-3 text-xs">{p.status?.replace(/_/g, " ")}</td>
                    <td className="px-3 py-3">{p.totalUnits ?? "—"}</td>
                    <td className="px-3 py-3">{p.completionPercentage != null ? `${p.completionPercentage}%` : "—"}</td>
                    <td className="px-3 py-3">{p.complaintCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
