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

      if (!data || data.length === 0) break;

      allBillingRecords = [...allBillingRecords, ...data];

      if (data.length < pageSize) break;

      from += pageSize;
    }

    setSubmissions(submissionData || []);
    setBillingRecords(allBillingRecords);
  }

  useEffect(() => {
    loadData();
  }, []);

  const billingStats = useMemo(() => {
    const count = billingRecords.length;

    const grossTotal = billingRecords.reduce(
      (sum, record) => sum + Number(record.gross_fee || 0),
      0
    );

    const techTotal = billingRecords.reduce(
      (sum, record) => sum + Number(record.tech_fee || 0),
      0
    );

    const netTotal = billingRecords.reduce(
      (sum, record) => sum + Number(record.net_fee || 0),
      0
    );

    return {
      count,
      grossTotal,
      techTotal,
      netTotal,
      avgGross: count ? Math.round(grossTotal / count) : 0,
      avgTech: count ? Math.round(techTotal / count) : 0,
      avgNet: count ? Math.round(netTotal / count) : 0,
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
        groups[key] = { gross: 0, net: 0, tech: 0, count: 0 };
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
        grossFees: Math.round(data.gross),
        techFees: Math.round(data.tech),
        records: data.count,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [billingRecords]);

  const topClients = useMemo(() => {
    const groups: Record<string, { count: number; total: number }> = {};

    billingRecords.forEach((record) => {
      const name = record.client_name || "Unknown";

      if (!groups[name]) {
        groups[name] = { count: 0, total: 0 };
      }

      groups[name].count += 1;
      groups[name].total += Number(record.net_fee || record.gross_fee || 0);
    });

    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avg: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [billingRecords]);

  const clientVolumeChart = topClients.map((client) => ({
    name:
      client.name.length > 16
        ? client.name.slice(0, 16) + "..."
        : client.name,
    records: client.count,
  }));

  const totalGrossFees = "$" + Math.round(billingStats.grossTotal).toLocaleString();
  const totalTechFees = "$" + Math.round(billingStats.techTotal).toLocaleString();

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
            <StatCard title="BILLING RECORDS" value={billingStats.count} />
            <StatCard title="TOTAL GROSS FEES" value={totalGrossFees} />
            <StatCard title="TOTAL TECH FEES" value={totalTechFees} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard title="AVG GROSS FEE" value={"$" + billingStats.avgGross} />
            <StatCard title="AVG NET FEE" value={"$" + billingStats.avgNet} />
            <StatCard title="AVG TECH FEE" value={"$" + billingStats.avgTech} />
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

            <ChartCard title="Most Active Clients by Volume">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clientVolumeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="records" name="Records" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
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

            <ChartCard title="Tech Fees Eaten by Year">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={yearlyFeeTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="techFees" name="Tech Fees" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-4xl font-bold">Most Active Clients</h2>

            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 p-5"
                >
                  <div>
                    <div className="text-sm text-slate-400">#{index + 1}</div>
                    <div className="text-2xl font-semibold">{client.name}</div>
                    <div className="text-slate-500">{client.count} records</div>
                  </div>

                  <div className="text-4xl font-bold text-blue-700">
                    {"$" + client.avg}
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
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div className="mt-4 text-5xl font-bold text-slate-900">{value}</div>
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
