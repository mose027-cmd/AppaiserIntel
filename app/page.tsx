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

type BillingRecord = {
  id: number;
  order_date: string | null;
  client_name: string | null;
  gross_fee: number | null;
  tech_fee: number | null;
  net_fee: number | null;
  form_type: string | null;
  zip_code: string | null;
};

export default function Home() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [formType, setFormType] = useState("");
  const [loanType, setLoanType] = useState("");
  const [fee, setFee] = useState("");
  const [turnTime, setTurnTime] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: submissionData } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: billingData } = await supabase
      .from("billing_records")
      .select("*")
      .order("order_date", { ascending: false });

    setSubmissions(submissionData || []);
    setBillingRecords(billingData || []);
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
      setMessage("Error: " + error.message);
    } else {
      setMessage("Submitted successfully.");
      setCity("");
      setState("");
      setFormType("");
      setLoanType("");
      setFee("");
      setTurnTime("");
      loadData();
    }
  }

  const billingStats = useMemo(() => {
    const count = billingRecords.length;

    const grossTotal = billingRecords.reduce(
      (sum, r) => sum + Number(r.gross_fee || 0),
      0
    );

    const techTotal = billingRecords.reduce(
      (sum, r) => sum + Number(r.tech_fee || 0),
      0
    );

    const netTotal = billingRecords.reduce(
      (sum, r) => sum + Number(r.net_fee || 0),
      0
    );

    return {
      count,
      avgGross: count ? Math.round(grossTotal / count) : 0,
      avgTech: count ? Math.round(techTotal / count) : 0,
      avgNet: count ? Math.round(netTotal / count) : 0,
      grossTotal,
      techTotal,
      netTotal,
    };
  }, [billingRecords]);

  const topPayingClients = useMemo(() => {
    const groups: Record<string, { count: number; total: number }> = {};

    billingRecords.forEach((r) => {
      const name = r.client_name || "Unknown";
      if (!groups[name]) groups[name] = { count: 0, total: 0 };
      groups[name].count += 1;
      groups[name].total += Number(r.net_fee || r.gross_fee || 0);
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avg: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [billingRecords]);

  const mostActiveClients = useMemo(() => {
    const groups: Record<string, { count: number; total: number }> = {};

    billingRecords.forEach((r) => {
      const name = r.client_name || "Unknown";
      if (!groups[name]) groups[name] = { count: 0, total: 0 };
      groups[name].count += 1;
      groups[name].total += Number(r.net_fee || r.gross_fee || 0);
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        total: data.total,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [billingRecords]);

  const avgSubmissionFee =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + Number(s.fee || 0), 0) /
            submissions.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
          <div className="mb-10 text-3xl font-bold text-blue-700">
            AppraiserIntel
          </div>

          <nav className="space-y-3">
            {[
              "Dashboard",
              "Fee Search",
              "Submit Data",
              "Billing Intel",
              "AMC Scorecard",
              "Market Trends",
              "Reports",
            ].map((item, index) => (
              <div
                key={item}
                className={
                  index === 0
                    ? "rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
                    : "cursor-pointer rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100"
                }
              >
                {item}
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-10">
          <h1 className="text-6xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-2xl text-slate-600">
            Real fee data. Real market insight. Built for appraisers.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
            <StatCard title="COMMUNITY SUBMISSIONS" value={submissions.length} />
            <StatCard title="AVG COMMUNITY FEE" value={`$${avgSubmissionFee}`} />
            <StatCard title="BILLING RECORDS" value={billingStats.count} />
            <StatCard
              title="TOTAL GROSS FEES"
              value={`$${Math.round(billingStats.grossTotal).toLocaleString()}`}
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-4xl font-bold">Billing Intelligence</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatCard title="AVG GROSS FEE" value={`$${billingStats.avgGross}`} />
              <StatCard title="AVG TECH FEE" value={`$${billingStats.avgTech}`} />
              <StatCard title="AVG NET FEE" value={`$${billingStats.avgNet}`} />
              <StatCard
                title="TOTAL TECH FEES"
                value={`$${Math.round(billingStats.techTotal).toLocaleString()}`}
              />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Leaderboard
              title="Top Paying Clients by Avg Net Fee"
              subtitle="Ranked by average net fee per record"
              items={topPayingClients}
              valueLabel="avg"
            />

            <Leaderboard
              title="Most Active Clients"
              subtitle="Ranked by number of billing records"
              items={mostActiveClients}
              valueLabel="count"
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 text-5xl font-bold">
              Anonymous Fee Submission
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input placeholder="City" value={city} setValue={setCity} />
              <Input placeholder="State" value={state} setValue={setState} />
              <Input
                placeholder="Form Type"
                value={formType}
                setValue={setFormType}
              />
              <Input
                placeholder="Loan Type"
                value={loanType}
                setValue={setLoanType}
              />
              <Input placeholder="Fee" value={fee} setValue={setFee} />
              <Input
                placeholder="Turn Time"
                value={turnTime}
                setValue={setTurnTime}
              />
            </div>

            <button
              onClick={submitData}
              className="mt-6 rounded-2xl bg-blue-700 px-8 py-4 text-xl font-semibold text-white transition hover:bg-blue-800"
            >
              Submit Anonymous Data
            </button>

            {message && <div className="mt-4 text-lg text-slate-600">{message}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
  placeholder,
  value,
  setValue,
}: {
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="rounded-2xl border border-slate-300 px-4 py-4 text-xl"
    />
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className="mt-4 text-5xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Leaderboard({
  title,
  subtitle,
  items,
  valueLabel,
}: {
  title: string;
  subtitle: string;
  items: any[];
  valueLabel: "avg" | "count";
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-4xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-500">{subtitle}</p>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
          >
            <div>
              <div className="text-sm text-slate-400">#{index + 1}</div>
              <div className="text-2xl font-semibold">{item.name}</div>
              <div className="text-slate-500">{item.count} records</div>
            </div>

            <div className="text-4xl font-bold text-blue-700">
              {valueLabel === "avg"
                ? `$${item.avg}`
                : item.count.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
