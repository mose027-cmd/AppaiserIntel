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
      await loadData();
    }
  }

  const totalSubmissions = submissions.length;

  const avgFee =
    totalSubmissions > 0
      ? Math.round(
          submissions.reduce((sum, item) => sum + Number(item.fee || 0), 0) /
            totalSubmissions
        )
      : 0;

  const activeMarkets = new Set(
    submissions.map((item) => `${item.city}, ${item.state}`)
  ).size;

  const loanTypeAverages = useMemo(() => {
    const groups: Record<string, number[]> = {};

    submissions.forEach((item) => {
      const key = item.loan_type || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(Number(item.fee || 0));
    });

    return Object.entries(groups).map(([name, fees]) => ({
      name,
      avg: Math.round(fees.reduce((a, b) => a + b, 0) / fees.length),
      count: fees.length,
    }));
  }, [submissions]);

  const formTypeAverages = useMemo(() => {
    const groups: Record<string, number[]> = {};

    submissions.forEach((item) => {
      const key = item.form_type || "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(Number(item.fee || 0));
    });

    return Object.entries(groups).map(([name, fees]) => ({
      name,
      avg: Math.round(fees.reduce((a, b) => a + b, 0) / fees.length),
      count: fees.length,
    }));
  }, [submissions]);

  const highestFee =
    submissions.length > 0
      ? Math.max(...submissions.map((item) => Number(item.fee || 0)))
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-2xl font-bold text-blue-900">
            AppraiserIntel
          </div>

          <nav className="space-y-3 text-slate-700">
            <div className="rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700">
              Dashboard
            </div>
            <div className="cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-100">
              Fee Search
            </div>
            <div className="cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-100">
              Submit Data
            </div>
            <div className="cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-100">
              AMC Scorecard
            </div>
            <div className="cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-100">
              Market Trends
            </div>
            <div className="cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-100">
              Reports
            </div>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-lg text-slate-600">
              Real fee data. Real market insight. Built for appraisers.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-500">TOTAL SUBMISSIONS</div>
              <div className="mt-3 text-5xl font-bold">{totalSubmissions}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-500">AVG FEE</div>
              <div className="mt-3 text-5xl font-bold">${avgFee}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-500">ACTIVE MARKETS</div>
              <div className="mt-3 text-5xl font-bold">{activeMarkets}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-500">HIGHEST FEE</div>
              <div className="mt-3 text-5xl font-bold">${highestFee}</div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-3xl font-bold">
              Anonymous Fee Submission
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              className="mt-6 rounded-xl bg-blue-700 px-8 py-4 font-semibold text-white hover:bg-blue-800"
            >
              Submit Anonymous Data
            </button>

            {message && <div className="mt-4 text-sm text-slate-600">{message}</div>}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-3xl font-bold">
                Avg Fee by Loan Type
              </h2>

              <div className="space-y-4">
                {loanTypeAverages.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-5"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-500">
                        {item.count} submission{item.count === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-blue-900">
                      ${item.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-3xl font-bold">
                Avg Fee by Form Type
              </h2>

              <div className="space-y-4">
                {formTypeAverages.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-5"
                  >
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-500">
                        {item.count} submission{item.count === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-blue-900">
                      ${item.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-3xl font-bold">Recent Submissions</h2>

            <div className="space-y-4">
              {submissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="text-lg font-semibold">
                    {item.city}, {item.state}
                  </div>

                  <div className="mt-2 text-slate-600">
                    {item.form_type} / {item.loan_type}
                  </div>

                  <div className="mt-2 font-medium text-slate-900">
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
