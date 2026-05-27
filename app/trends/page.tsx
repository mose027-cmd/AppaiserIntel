"use client";

import DashboardShell from "../../components/DashboardShell";

export default function TrendsPage() {
  return (
    <DashboardShell>

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Assignment Trends
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
          Assignment Trends
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Assignment category movement, workload trends,
          and reporting pattern intelligence.
        </p>

      </div>

    </DashboardShell>
  );
}