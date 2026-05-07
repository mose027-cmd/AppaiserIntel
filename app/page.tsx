"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Submission = {
  id: number;
  city: string;
  state: string;
  form_type: string;
  loan_type: string;
  fee: number;
  turn_time: string;
};

export default function Home() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [formType, setFormType] = useState("");
  const [loanType, setLoanType] = useState("");
  const [fee, setFee] = useState("");
  const [turnTime, setTurnTime] = useState("");
  const [message, setMessage] = useState("");

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [search, setSearch] = useState("");
  const [loanFilter, setLoanFilter] = useState("All");
  const [formFilter, setFormFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

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
      console.error(error);
    } else {
      setMessage("Submitted successfully.");

      setCity("");
      setState("");
      setFormType("");
      setLoanType("");
      setFee("");
      setTurnTime("");

      loadSubmissions();
    }
  }

  const filteredSubmissions = useMemo(() => {
    let results = [...submissions];

    if (search.trim()) {
      results = results.filter((s) =>
        `${s.city} ${s.state} ${s.form_type} ${s.loan_type}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (loanFilter !== "All") {
      results = results.filter((s) => s.loan_type === loanFilter);
    }

    if (formFilter !== "All") {
      results = results.filter((s) => s.form_type === formFilter);
    }

    if (sortOrder === "Highest Fee") {
      results.sort((a, b) => b.fee - a.fee);
    } else if (sortOrder === "Lowest Fee") {
      results.sort((a, b) => a.fee - b.fee);
    }

    return results;
  }, [submissions, search, loanFilter, formFilter, sortOrder]);

  const avgFee =
    filteredSubmissions.length > 0
      ? Math.round(
          filteredSubmissions.reduce((acc, cur) => acc + cur.fee, 0) /
            filteredSubmissions.length
        )
      : 0;

  const highestFee =
    filteredSubmissions.length > 0
      ? Math.max(...filteredSubmissions.map((s) => s.fee))
      : 0;

  const activeMarkets = new Set(
    filteredSubmissions.map((s) => s.city)
  ).size;

  const loanTypeStats = Object.entries(
    filteredSubmissions.reduce((acc: any, curr) => {
      if (!acc[curr.loan_type]) {
        acc[curr.loan_type] = {
          count: 0,
          total: 0,
        };
      }

      acc[curr.loan_type].count += 1;
      acc[curr.loan_type].total += curr.fee;

      return acc;
    }, {})
  );

  const formTypeStats = Object.entries(
    filteredSubmissions.reduce((acc: any, curr) => {
      if (!acc[curr.form_type]) {
        acc[curr.form_type] = {
          count: 0,
          total: 0,
        };
      }

      acc[curr.form_type].count += 1;
      acc[curr.form_type].total += curr.fee;

      return acc;
    }, {})
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-3xl font-bold text-blue-700">
            AppraiserIntel
          </div>

          <nav className="space-y-3">
            <div className="rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700">
              Dashboard
            </div>

            {[
              "Fee Search",
              "Submit Data",
              "AMC Scorecard",
              "Market Trends",
              "Reports",
            ].map((item) => (
              <div
                key={item}
                className="cursor-pointer rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100"
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-10">
          <h1 className="text-6xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-2xl text-slate-600">
            Real fee data. Real market insight. Built for appraisers.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
            <StatCard
              title="MATCHING SUBMISSIONS"
              value={filteredSubmissions.length}
            />

            <StatCard title="AVG FEE" value={`$${avgFee}`} />

            <StatCard
              title="ACTIVE MARKETS"
              value={activeMarkets}
            />

            <StatCard
              title="HIGHEST FEE"
              value={`$${highestFee}`}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-4xl font-bold">
              Fee Search
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <input
                placeholder="Search city, state, form, loan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-lg outline-none focus:border-blue-500"
              />

              <select
                value={loanFilter}
                onChange={(e) => setLoanFilter(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-lg"
              >
                <option>All</option>
                <option>Conventional</option>
                <option>FHA</option>
                <option>VA</option>
              </select>

              <select
                value={formFilter}
                onChange={(e) => setFormFilter(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-lg"
              >
                <option>All</option>
                <option>1004 URAR</option>
                <option>1073 Condo</option>
                <option>1025 Multi-Family</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-lg"
              >
                <option>Newest</option>
                <option>Highest Fee</option>
                <option>Lowest Fee</option>
              </select>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-5xl font-bold">
              Anonymous Fee Submission
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />

              <input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />

              <input
                placeholder="Form Type"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />

              <input
                placeholder="Loan Type"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />

              <input
                placeholder="Fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />

              <input
                placeholder="Turn Time"
                value={turnTime}
                onChange={(e) => setTurnTime(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
              />
            </div>

            <button
              onClick={submitData}
              className="mt-6 rounded-2xl bg-blue-700 px-8 py-4 text-xl font-semibold text-white transition hover:bg-blue-800"
            >
              Submit Anonymous Data
            </button>

            {message && (
              <div className="mt-4 text-lg text-slate-600">
                {message}
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <AnalyticsCard
              title="Avg Fee by Loan Type"
              stats={loanTypeStats}
            />

            <AnalyticsCard
              title="Avg Fee by Form Type"
              stats={formTypeStats}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-5xl font-bold">
              Recent Submissions
            </h2>

            <div className="space-y-4">
              {filteredSubmissions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-200 p-6"
                >
                  <div className="text-3xl font-semibold">
                    {s.city}, {s.state}
                  </div>

                  <div className="mt-2 text-xl text-slate-600">
                    {s.form_type} / {s.loan_type}
                  </div>

                  <div className="mt-4 text-3xl font-bold text-blue-700">
                    ${s.fee} — {s.turn_time}
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

function StatCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div className="mt-4 text-6xl font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  stats,
}: {
  title: string;
  stats: any[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="mb-6 text-4xl font-bold">{title}</h3>

      <div className="space-y-4">
        {stats.map(([name, data]: any) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
          >
            <div>
              <div className="text-2xl font-semibold">{name}</div>

              <div className="text-slate-500">
                {data.count} submissions
              </div>
            </div>

            <div className="text-4xl font-bold text-blue-700">
              $
              {Math.round(data.total / data.count)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
