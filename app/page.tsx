"use client";

import { useState } from "react";
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
      setMessage("Error submitting data.");
      console.error(error);
    } else {
      setMessage("Submitted successfully.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-2xl font-bold text-blue-900">AppraiserIntel</div>
          <nav className="space-y-2 text-sm font-medium text-slate-600">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-700">Dashboard</div>
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-blue-950">
              Anonymous Fee Submission
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-xl border px-4 py-3" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className="rounded-xl border px-4 py-3" value={state} onChange={(e) => setState(e.target.value)} />
              <input className="rounded-xl border px-4 py-3" value={formType} onChange={(e) => setFormType(e.target.value)} />
              <input className="rounded-xl border px-4 py-3" value={loanType} onChange={(e) => setLoanType(e.target.value)} />
              <input className="rounded-xl border px-4 py-3" value={fee} onChange={(e) => setFee(e.target.value)} />
              <input className="rounded-xl border px-4 py-3" value={turnTime} onChange={(e) => setTurnTime(e.target.value)} />
            </div>

            <button
              onClick={submitData}
              className="mt-4 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Submit Anonymous Data
            </button>

            {message && <p className="mt-3 text-sm font-semibold">{message}</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
