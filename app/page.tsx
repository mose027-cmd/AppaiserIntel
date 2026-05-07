"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Submission = {
  id: number;
  city: string | null;
  state: string | null;
  form_type: string | null;
  loan_type: string | null;
  fee: number | null;
  turn_time: string | null;
  created_at: string | null;
};

export default function Home() {
  const [city, setCity] = useState("Cincinnati");
  const [state, setState] = useState("Ohio");
  const [formType, setFormType] = useState("1004 URAR");
  const [loanType, setLoanType] = useState("Conventional");
  const [fee, setFee] = useState("425");
  const [turnTime, setTurnTime] = useState("7 business days");
  const [message, setMessage] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");

  async function loadSubmissions() {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubmissions(data);
    }
  }

  useEffect(() => {
    loadSubmissions();
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
      setMessage("Error: " + error.message);
    } else {
      setMessage("Submitted successfully.");
      await loadSubmissions();
    }
  }

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const cityMatch = filterCity
        ? item.city?.toLowerCase().includes(filterCity.toLowerCase())
        : true;

      const stateMatch = filterState
        ? item.state?.toLowerCase().includes(filterState.toLowerCase())
        : true;

      return cityMatch && stateMatch;
    });
  }, [submissions, filterCity, filterState]);

  const totalSubmissions = filteredSubmissions.length;

  const averageFee =
    filteredSubmissions.length > 0
      ? Math.round(
          filteredSubmissions.reduce(
            (sum, item) => sum + Number(item.fee || 0),
            0
          ) / filteredSubmissions.length
        )
      : 0;

  const activeMarkets = new Set(
    filteredSubmissions.map((item) => `${item.city}, ${item.state}`)
  ).size;

  const loanTypeAverages = useMemo(() => {
    const groups: Record<string, number[]> = {};

    filteredSubmissions.forEach((item) => {
      const key = item.loan_type || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(Number(item.fee || 0));
    });

    return Object.entries(groups).map(([loan, fees]) => ({
      loan,
      average: Math.round(fees.reduce((a, b) => a + b, 0) / fees.length),
      count: fees.length,
    }));
  }, [filteredSubmissions]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-2xl font-bold text-blue-900">
            AppraiserIntel
          </div>

          <nav className="space-y-2 text-sm font-medium text-slate-600">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
              Dashboard
            </div>
            <div className="px-4 py-3">Fee Search</div>
            <div className="px-4 py-3">Submit Data</div>
            <div className="px-4 py-3">AMC Scorecard</div>
            <div className="px-4 py-3">Market Trends</div>
            <div className="px-4 py-3">Reports</div>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <h1 className="text-3xl font-bold text-blue-950">Dashboard</h1>
          <p className="mb-8 text-slate-500">
            Real fee data. Real market insight. Built for appraisers.
          </p>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-blue-950">
              Fee Search
            </h2>

            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Filter by city"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Filter by state"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
              />

              <button
                onClick={() => {
                  setFilterCity("");
                  setFilterState("");
                }}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Matching Submissions
              </p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">
                {totalSubmissions}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Avg Fee
              </p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">
                ${averageFee}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Active Markets
              </p>
              <h2 className="mt-3 text-4xl font-bold text-blue-950">
                {activeMarkets}
              </h2>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-blue-950">
              Average Fee by Loan Type
            </h2>

            <div className="space-y-3">
              {loanTypeAverages.length === 0 && (
                <p className="text-slate-500">No matching data yet.</p>
              )}

              {loanTypeAverages.map((item) => (
                <div
                  key={item.loan}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-semibold">{item.loan}</p>
                    <p className="text-sm text-slate-500">
                      {item.count} submission{item.count === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-blue-950">
                    ${item.average}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-blue-950">
              Anonymous Fee Submission
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-xl border px-4 py-3"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />

              <input
                className="rounded-xl border px-4 py-3"
                value={turnTime}
                onChange={(e) => setTurnTime(e.target.value)}
              />
            </div>

            <button
              onClick={submitData}
              className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Submit Anonymous Data
            </button>

            {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-blue-950">
              Recent Submissions
            </h2>

            <div className="space-y-3">
              {filteredSubmissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 text-sm"
                >
                  <strong>
                    {item.city}, {item.state}
                  </strong>{" "}
                  — {item.form_type} / {item.loan_type} — ${item.fee} —{" "}
                  {item.turn_time}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
