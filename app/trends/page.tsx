"use client";

import DashboardShell from "../../components/DashboardShell";
import VerifiedAccess from "../../components/VerifiedAccess";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const assignmentMixData = [
  { type: "1004 URAR", count: 84 },
  { type: "FHA", count: 42 },
  { type: "VA", count: 25 },
  { type: "Desktop", count: 18 },
  { type: "Final", count: 36 },
  { type: "Complex", count: 14 },
];

const monthlyTrendData = [
  { month: "Jan", urar: 20, fha: 10, va: 5, desktop: 3 },
  { month: "Feb", urar: 24, fha: 12, va: 6, desktop: 4 },
  { month: "Mar", urar: 28, fha: 14, va: 7, desktop: 5 },
  { month: "Apr", urar: 26, fha: 13, va: 8, desktop: 6 },
  { month: "May", urar: 32, fha: 16, va: 9, desktop: 7 },
  { month: "Jun", urar: 36, fha: 18, va: 10, desktop: 8 },
];

const workloadData = [
  {
    metric: "Assignment Mix",
    status: "Balanced Residential Activity",
  },
  {
    metric: "Report Type Movement",
    status: "Increasing Full-Form Volume",
  },
  {
    metric: "Workflow Demand",
    status: "Stable Assignment Flow",
  },
];

export default function TrendsPage() {
  return (
  <VerifiedAccess>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Assignment Trends
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Assignment Trends
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Assignment category movement, report-type mix, and workload trend
            intelligence across contributor activity.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <MetricCard
            title="Total Assignments"
            value="219"
            subtitle="Tracked contributor activity"
          />

          <MetricCard
            title="Primary Report Type"
            value="1004 URAR"
            subtitle="Highest assignment concentration"
          />

          <MetricCard
            title="Full-Form Share"
            value="38.4%"
            subtitle="Share of tracked assignment mix"
          />

          <MetricCard
            title="Workflow Direction"
            value="Stable"
            subtitle="Observed assignment movement"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Assignment Mix
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Current distribution of appraisal assignment categories
              </p>
            </div>

            <div className="mt-8 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentMixData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="type" />

                  <YAxis />

                  <Tooltip />

                  <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Report Type Movement
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Assignment category movement across recent reporting periods
              </p>
            </div>

            <div className="mt-8 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="urar"
                    stroke="#0f172a"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="fha"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="va"
                    stroke="#64748b"
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="desktop"
                    stroke="#94a3b8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Workload Trend Insights
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Assignment mix and workload movement indicators
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {workloadData.map((item) => (
              <InsightCard
                key={item.metric}
                title={item.metric}
                value={item.status}
              />
            ))}
          </div>
        </section>
      </div>
</VerifiedAccess>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-4xl font-bold text-slate-950">{value}</p>

      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}