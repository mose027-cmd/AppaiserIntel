"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("verification_status")
        .eq("id", user.id)
        .single();

      if (!profile) {
        window.location.href = "/verify";
        return;
      }

      if (profile.verification_status !== "approved") {
        alert("Your verification is still pending approval.");
        window.location.href = "/verify";
        return;
      }
    }

    loadUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Verified Contributor Portal
            </p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              AppraiserIntel Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Signed in as {email}
            </p>
          </div>

          <button
            onClick={signOut}
            className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Submissions</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">0</p>
            <p className="mt-2 text-sm text-slate-500">Contributor records</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Avg Gross Fee</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">$0</p>
            <p className="mt-2 text-sm text-slate-500">Before technology fees</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Avg Net Fee</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">$0</p>
            <p className="mt-2 text-sm text-slate-500">After technology fees</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Avg Turn Time</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">0 days</p>
            <p className="mt-2 text-sm text-slate-500">Assignment to delivery</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              Market Intelligence Overview
            </h2>
            <p className="mt-2 text-slate-600">
              Fee trends, AMC operational benchmarks, lender patterns, and revision burden analytics will appear here as verified contributor data grows.
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Analytics charts coming next
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Contributor Status
            </h2>
            <p className="mt-2 text-slate-600">
              Verified appraiser access enabled.
            </p>

            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-green-800">
              Approved Contributor
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
