"use client";

import DashboardShell from "../../components/DashboardShell";
import { useVerificationStatus } from "../../lib/useVerificationStatus";

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

const trendData = [
  { month: "Jan", gross: 500, net: 470, tech: 30 },
  { month: "Feb", gross: 520, net: 485, tech: 35 },
  { month: "Mar", gross: 560, net: 520, tech: 40 },
  { month: "Apr", gross: 590, net: 545, tech: 45 },
  { month: "May", gross: 610, net: 560, tech: 50 },
  { month: "Jun", gross: 650, net: 595, tech: 55 },
];

const retentionData = [
  { category: "Gross Retained", value: 91 },
  { category: "Technology Fees", value: 9 },
];

const clientData = [
  {
    client: "Market-Aligned Group",
    positioning: "Above-Market Compensation",
    retention: "94%",
  },
  {
    client: "Regional Valuation",
    positioning: "Market-Aligned Compensation",
    retention: "89%",
  },
  {
    client: "National Residential",
    positioning: "Consistent Compensation",
    retention: "92%",
  },
];

export default function CompensationPage() {
      const { loading, isVerified } = useVerificationStatus();

  if (loading) {
    return (
      <DashboardShell>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">
            Loading access status...
          </h1>
        </div>
      </DashboardShell>
    );
  }

  if (!isVerified) {
    return (
      <DashboardShell>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Verified Contributor Access
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Verification Required
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Compensation Intelligence is available to verified residential
            appraisal professionals participating in the contributor network.
          </p>
        </div>
      </DashboardShell>
    );
  }
  return (
    <DashboardShell>

      <div className="space-y-8">

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Compensation Intelligence
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Compensation Intelligence
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Compensation benchmarking, operational profitability,
            and fee movement analytics across your contributor intelligence layer.
          </p>

        </section>

        <section className="grid gap-6 md:grid-cols-4">

          <MetricCard
            title="Avg Gross Fee"
            value="$612"
            subtitle="Before operational deductions"
          />

          <MetricCard
            title="Avg Net Fee"
            value="$558"
            subtitle="Compensation after technology costs"
          />

          <MetricCard
            title="Compensation Retention"
            value="91.2%"
            subtitle="Gross compensation retained"
          />

          <MetricCard
            title="Operational Profitability"
            value="$132/day"
            subtitle="Net compensation per operational day"
          />

        </section>

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Compensation Movement
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Gross, net, and technology fee movement across recent assignments
              </p>
            </div>

            <div className="mt-8 h-96">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="gross"
                    stroke="#0f172a"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="tech"
                    stroke="#94a3b8"
                    strokeWidth={2}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Compensation Retention
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Gross compensation retained after operational technology costs
              </p>
            </div>

            <div className="mt-8 h-96">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="category" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#0f172a"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Benchmark Insights
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Operational compensation positioning across contributor activity
              </p>
            </div>

          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            <InsightCard
              title="Compensation Positioning"
              value="Above-Market Compensation"
            />

            <InsightCard
              title="Operational Efficiency"
              value="Consistent Profitability Alignment"
            />

            <InsightCard
              title="Fee Retention"
              value="Elevated Compensation Retention"
            />

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Client Compensation Analysis
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Compensation positioning and operational retention patterns
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">

            <table className="min-w-full divide-y divide-slate-200">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compensation Positioning
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Retention
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">

                {clientData.map((item) => (
                  <tr key={item.client}>

                    <td className="px-6 py-4 text-sm font-medium text-slate-950">
                      {item.client}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.positioning}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                      {item.retention}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </DashboardShell>
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