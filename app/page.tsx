"use client";

import { useEffect, useState } from "react";
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

  const totalSubmissions = submissions.length;

  const averageFee =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, item) => sum + Number(item.fee || 0), 0) /
            submissions.length
        )
      : 0;

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

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total Submissions
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
                {new Set(submissions.map((item) => item.city)).size}
              </h2>
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
              {submissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 text-sm"
                >
                  <strong>{item.city}, {item.state}</strong> — {item.form_type} /{" "}
                  {item.loan_type} — ${item.fee} — {item.turn_time}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
