"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [city, setCity] = useState("Cincinnati");
  const [state, setState] = useState("Ohio");
  const [formType, setFormType] = useState("1004 URAR");
  const [loanType, setLoanType] = useState("Conventional");
  const [fee, setFee] = useState("425");
  const [turnTime, setTurnTime] = useState("7 business days");

  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgFee: 0,
    activeMarkets: 0,
  });

  async function loadData() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setSubmissions(data || []);

    const total = data?.length || 0;

    const avgFee =
      total > 0
        ? Math.round(
            data.reduce((sum, item) => sum + (item.fee || 0), 0) / total
          )
        : 0;

    const markets = new Set(data?.map((x) => x.city)).size;

    setStats({
      total,
      avgFee,
      activeMarkets: markets,
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitData() {
    setMessage("Submitting...");

    const { error } = await supabase.from("submissions").insert([
      {
        city,
        state,
        form_type: formType,
        loan_type: loanType,
        fee: Number(fee),
        turn_time: turnTime,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("Error: " + error.message);
    } else {
      setMessage("Submitted successfully.");

      setFee("");
      setTurnTime("");

      loadData();
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-slate-200 bg-white p-6">
          <div className="mb-10 text-2xl font-bold text-blue-900">
            AppraiserIntel
          </div>

          <nav className="space-y-3 text-slate-700">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-700 font-medium">
              Dashboard
            </div>

            <div className="px-4 py-3 hover:bg-slate-100 rounded-xl cursor-pointer">
              Fee Search
            </div>

            <div className="px-4 py-3 hover:bg-slate-100 rounded-xl cursor-pointer">
              Submit Data
            </div>

            <div className="px-4 py-3 hover:bg-slate-100 rounded-xl cursor-pointer">
              AMC Scorecard
            </div>

            <div className="px-4 py-3 hover:bg-slate-100 rounded-xl cursor-pointer">
              Market Trends
            </div>

            <div className="px-4 py-3 hover:bg-slate-100 rounded-xl cursor-pointer">
              Reports
            </div>
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1 p-10">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-2 text-slate-600 text-lg">
              Real fee data. Real market insight. Built for appraisers.
            </p>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm">
                TOTAL SUBMISSIONS
              </div>

              <div className="mt-3 text-5xl font-bold">
                {stats.total}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm">
                AVG FEE
              </div>

              <div className="mt-3 text-5xl font-bold">
                ${stats.avgFee}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="text-slate-500 text-sm">
                ACTIVE MARKETS
              </div>

              <div className="mt-3 text-5xl font-bold">
                {stats.activeMarkets}
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-3xl font-bold mb-8">
              Anonymous Fee Submission
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="rounded-xl border border-slate-300 p-4"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />

              <input
                className="rounded-xl border border-slate-300 p-4"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
              />

              <input
                className="rounded-xl border border-slate-300 p-4"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                placeholder="Form Type"
              />

              <input
                className="rounded-xl border border-slate-300 p-4"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                placeholder="Loan Type"
              />

              <input
                className="rounded-xl border border-slate-300 p-4"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="Fee"
              />

              <input
                className="rounded-xl border border-slate-300 p-4"
                value={turnTime}
                onChange={(e) => setTurnTime(e.target.value)}
                placeholder="Turn Time"
              />
            </div>

            <button
              onClick={submitData}
              className="mt-6 rounded-xl bg-blue-700 px-8 py-4 text-white font-semibold hover:bg-blue-800"
            >
              Submit Anonymous Data
            </button>

            {message && (
              <div className="mt-4 text-sm text-slate-600">
                {message}
              </div>
            )}
          </div>

          {/* Recent Submissions */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold mb-6">
              Recent Submissions
            </h2>

            <div className="space-y-4">
              {submissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="font-semibold text-lg">
                    {item.city}, {item.state}
                  </div>

                  <div className="mt-2 text-slate-600">
                    {item.form_type} / {item.loan_type}
                  </div>

                  <div className="mt-2 text-slate-900 font-medium">
                    ${item.fee} — {item.turn_time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
