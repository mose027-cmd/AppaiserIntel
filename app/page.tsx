```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

    let allBillingRecords: BillingRecord[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("billing_records")
        .select("*")
        .order("order_date", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error(error);
        break;
      }

      if (!data || data.length === 0) {
        break;
      }

      allBillingRecords = [...allBillingRecords, ...data];

      if (data.length < pageSize) {
        break;
      }

      from += pageSize;
    }

    setSubmissions(submissionData || []);
    setBillingRecords(allBillingRecords);
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

  const yearlyFeeTrend = useMemo(() => {
    const groups: Record<
      string,
      { gross: number; net: number; tech: number; count: number }
    > = {};

    billingRecords.forEach((record) => {
      if (!record.order_date) return;

      const year = new Date(record.order_date).getFullYear();

      if (!year || year < 1990 || year > 2100) return;

      const key = String(year);

      if (!groups[key]) {
        groups[key] = {
          gross: 0,
          net: 0,
          tech: 0,
          count: 0,
        };
      }

      groups[key].gross += Number(record.gross_fee || 0);
      groups[key].net += Number(record.net_fee || 0);
      groups[key].tech += Number(record.tech_fee || 0);
      groups[key].count += 1;
    });

    return Object.entries(groups)
      .map(([year, data]) => ({
        year,
        avgGross: Math.round(data.gross / data.count),
        avgNet: Math.round(data.net / data.count),
        techFees: Math.round(data.tech),
        grossFees: Math.round(data.gross),
        records: data.count,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [billingRecords]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="p-10">
        <h1 className="text-6xl font-bold">Dashboard</h1>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <StatCard title="COMMUNITY SUBMISSIONS" value={submissions.length} />
          <StatCard title="BILLING RECORDS" value={billingStats.count} />
          <StatCard
            title="TOTAL GROSS FEES"
            value={`$${Math.round(
              billingStats.grossTotal
            ).toLocaleString()}`}
          />
          <StatCard
            title="TOTAL TECH FEES"
            value={`$${Math.round(
              billingStats.techTotal
            ).toLocaleString()}`}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard title="Average Fee Trend by Year">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={yearlyFeeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgGross"
                  strokeWidth={3}
                  name="Avg Gross Fee"
                />
                <Line
                  type="monotone"
                  dataKey="avgNet"
                  strokeWidth={3}
                  name="Avg Net Fee"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Gross Fees by Year">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={yearlyFeeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grossFees" name="Gross Fees" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div className="mt-4 text-5xl font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="mb-6 text-4xl font-bold">{title}</h3>
      {children}
    </div>
  );
}
```
