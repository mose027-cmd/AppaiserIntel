"use client";

import DashboardShell from "../../components/DashboardShell";

export default function OperationsPage() {
  return (
    <DashboardShell>

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Operational Benchmarking
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
          Operational Benchmarking
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Turn-cycle benchmarking, revision analytics,
          and operational efficiency intelligence.
        </p>

      </div>

    </DashboardShell>
  );
}