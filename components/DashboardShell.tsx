"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">

      <Sidebar />

      <div className="ml-72 min-h-screen">

        <Topbar />

<main className="p-8">
  <div className="mx-auto max-w-7xl">
    {children}
  </div>
</main>

      </div>

    </div>
  );
}