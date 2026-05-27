"use client";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">

      <div>
        <p className="text-sm font-medium text-slate-500">
          Operational Intelligence Platform
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Network Status
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-950">
            Intelligence Layer Active
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          RM
        </div>

      </div>
    </header>
  );
}