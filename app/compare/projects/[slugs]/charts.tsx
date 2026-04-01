"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProjectData {
  name: string;
  trustScore: number;
  complaintCount: number;
  completionPercentage: number | null;
}

export function ProjectComparisonCharts({ data }: { data: ProjectData[] }) {
  return (
    <div className="mt-10 space-y-10">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Trust Score Comparison</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="trustScore" fill="#2563eb" name="Trust Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
