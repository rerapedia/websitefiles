"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BuilderComparison {
  name: string;
  slug: string;
  totalProjects: number;
  avgTrustScore: number;
  completedProjects: number;
  delayedProjects: number;
  onTimeRate: number;
}

export default function CompareBuildersDashboard() {
  const [slugInput, setSlugInput] = useState("");
  const [builders, setBuilders] = useState<BuilderComparison[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    const slugs = slugInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length < 2) {
      alert("Enter at least 2 builder slugs separated by commas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/investor/compare?type=builders&slugs=${slugs.join(",")}`);
      const data = await res.json();
      if (data.success) {
        setBuilders(data.data.items);
      }
    } catch {
      alert("Failed to fetch comparison data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Compare Builders</h1>
      <p className="mt-1 text-sm text-gray-600">Side-by-side builder analysis with visual charts</p>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="Enter builder slugs: dlf-limited, emaar-india, m3m-india"
          className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
        />
        <button onClick={handleCompare} disabled={loading} className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {builders.length > 0 && (
        <>
          {/* Trust Score Chart */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Average Trust Score</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={builders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgTrustScore" fill="#2563eb" name="Avg Trust Score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Stats Chart */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Project Statistics</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={builders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalProjects" fill="#2563eb" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedProjects" fill="#16a34a" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayedProjects" fill="#dc2626" name="Delayed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">Builder</th>
                  <th className="px-3 py-3">Avg Score</th>
                  <th className="px-3 py-3">Total Projects</th>
                  <th className="px-3 py-3">Completed</th>
                  <th className="px-3 py-3">Delayed</th>
                  <th className="px-3 py-3">On-Time Rate</th>
                </tr>
              </thead>
              <tbody>
                {builders.map((b) => (
                  <tr key={b.slug} className="border-b">
                    <td className="px-3 py-3 font-medium">{b.name}</td>
                    <td className="px-3 py-3 font-semibold text-brand-primary">{b.avgTrustScore}/100</td>
                    <td className="px-3 py-3">{b.totalProjects}</td>
                    <td className="px-3 py-3 text-green-600">{b.completedProjects}</td>
                    <td className="px-3 py-3 text-red-600">{b.delayedProjects}</td>
                    <td className="px-3 py-3">{b.onTimeRate}%</td>
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
