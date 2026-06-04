"use client";

import { usePathname } from "next/navigation";
import { useVerificationStatus } from "../lib/useVerificationStatus";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/compensation": "Compensation Intelligence",
  "/operations": "Operational Benchmarking",
  "/trends": "Assignment Trends",
  "/submit": "Submit Intelligence",
  "/network": "Contributor Network",
  "/settings": "Settings",
  "/admin": "Verification Review Queue",
};

export default function Topbar() {
  const pathname = usePathname();
  const { status } = useVerificationStatus();

  const currentTitle =
    titles[pathname] || "Operational Intelligence Platform";

  const networkStatus =
    status === "verified"
      ? "Intelligence Layer Active"
      : status === "pending"
      ? "Verification Pending"
      : status === "rejected"
      ? "Review Required"
      : "Verification Required";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Operational Intelligence Platform
        </p>

        <h1 className="text-3xl font-bold text-slate-950">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Network Status
          </p>

          <p className="text-sm font-semibold text-slate-950">
            {networkStatus}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          RM
        </div>
      </div>
    </header>
  );
}