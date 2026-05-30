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

const turnTimeData = [
  { month: "Jan", days: 6.2 },
  { month: "Feb", days: 5.9 },
  { month: "Mar", days: 5.4 },
  { month: "Apr", days: 4.9 },
  { month: "May", days: 4.5 },
  { month: "Jun", days: 4.1 },
];

const revisionData = [
  { category: "Clarifications", count: 28 },
  { category: "Addendum Requests", count: 16 },
  { category: "QC Conditions", count: 11 },
  { category: "Additional Support", count: 8 },
];

const workflowData = [
  {
    metric: "Turn Cycle Alignment",
    status: "Market-Aligned Operational Timing",
  },
  {
    metric: "Revision Frequency",
    status: "Lower Revision Frequency",
  },
  {
    metric: "Operational Stability",
    status: "Consistent Workflow Efficiency",
  },
];

export default function OperationsPage() {
return (
  <VerifiedAccess>

      <div className="space-y-8">

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Operational Benchmarking
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Operational Benchmarking
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Turn-cycle intelligence, revision burden analytics,
            and operational workflow benchmarking across contributor activity.
          </p>

        </section>

        <section className="grid gap-6 md:grid-cols-4">

          <MetricCard
            title="Avg Turn Cycle"
            value="4.1 Days"
            subtitle="Assignment to delivery timing"
          />

          <MetricCard
            title="Avg Revision Frequency"
            value="0.7"
            subtitle="Revision rounds per assignment"
          />

          <MetricCard
            title="Operational Efficiency"
            value="High"
            subtitle="Workflow alignment indicator"
          />

          <MetricCard
            title="Workload Stability"
            value="Stable"
            subtitle="Consistent operational flow"
          />

        </section>

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Turn Cycle Movement
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Average assignment delivery timing across contributor activity
              </p>
            </div>

            <div className="mt-8 h-96">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={turnTimeData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="days"
                    stroke="#0f172a"
                    strokeWidth={3}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Revision Burden Analysis
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Revision category frequency across operational activity
              </p>
            </div>

            <div className="mt-8 h-96">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revisionData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="category" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#0f172a"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Workflow Benchmark Insights
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Operational workflow positioning and efficiency benchmarking
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            {workflowData.map((item) => (
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

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-3 text-sm text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}

function InsightCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </p>

    </div>
  );
}