"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BuilderData {
  name: string;
  avgTrustScore: number;
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  onTimeRate: number;
}

export function ComparisonCharts({ data }: { data: BuilderData[] }) {
  return (
    <div className="mt-10 space-y-10">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Trust Score Comparison</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avgTrustScore" fill="#2563eb" name="Avg Trust Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">Project Delivery Record</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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
    </div>
  );
}
