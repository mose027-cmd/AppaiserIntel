"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVerificationStatus } from "../lib/useVerificationStatus";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Compensation Intelligence", href: "/compensation" },
  { label: "Operational Benchmarking", href: "/operations" },
  { label: "Assignment Trends", href: "/trends" },
  { label: "Submit Data", href: "/submit" },
  { label: "Contributor Network", href: "/network" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const { status } = useVerificationStatus();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-8 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
          Appraiser Intel
        </p>

        <h1 className="mt-3 text-2xl font-bold">Intelligence Layer</h1>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Operational benchmarking and compensation intelligence for residential appraisal professionals.
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 px-6 py-6">
        <div className="rounded-2xl bg-slate-900 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Contributor Status
          </p>

<p className="mt-2 text-lg font-semibold">
  {status === "verified"
    ? "Verified Contributor"
    : status === "pending"
    ? "Pending Review"
    : status === "rejected"
    ? "Review Required"
    : "Unverified Contributor"}
</p>

<p className="mt-2 text-sm text-slate-400">
  {status === "verified"
    ? "Private intelligence access enabled"
    : status === "pending"
    ? "Verification currently under review"
    : status === "rejected"
    ? "Verification follow-up required"
    : "Submit verification request"}
</p>
        </div>
      </div>
    </aside>
  );
}