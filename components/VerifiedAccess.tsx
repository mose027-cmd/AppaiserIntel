"use client";

import { ReactNode } from "react";
import DashboardShell from "./DashboardShell";
import { useVerificationStatus } from "../lib/useVerificationStatus";

interface VerifiedAccessProps {
  children: ReactNode;
}

export default function VerifiedAccess({
  children,
}: VerifiedAccessProps) {
  const { loading, status } = useVerificationStatus();

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

  if (status === "verified") {
    return <>{children}</>;
  }

  return (
    <DashboardShell>
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Intelligence Layer Access
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
          {status === "pending"
            ? "Verification Pending"
            : status === "rejected"
            ? "Verification Follow-Up Required"
            : "Verification Required"}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {status === "pending"
            ? "Your contributor verification request is currently under review. Access will be enabled once verification is approved."
            : status === "rejected"
            ? "Your verification request requires follow-up before intelligence access can be enabled."
            : "Intelligence modules are available to verified residential appraisal professionals participating in the contributor network."}
        </p>
      </div>
    </DashboardShell>
  );
}