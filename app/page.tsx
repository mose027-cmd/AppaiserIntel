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

type BillingRecord = {
  "File No.": string;
  City: string | null;
  State: string | null;
  Zip: string | null;
  "Appraised Value": number | null;
  "Value Bucket": string | null;
  "Major Form": string | null;
  "Assignment Type": string | null;
  "Fee Total": number | null;
  "Technology Fees": number | null;
  "Net Fee": number | null;
  "Inspection Date": string | null;
  "Delivered Date": string | null;
  "Due Date": string | null;
  "Turn Time (Days)": number | null;
};

function money(value: number) {
  if (!Number.isFinite(value)) return "$0";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function avg(values: number[]) {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default function Home() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [valueFilter, setValueFilter] = useState("All");

  useEffect(() => {
    async function loadRecords() {
      const { data, error } = await supabase
        .from("billing_records")
        .select("*");

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setRecords((data || []) as BillingRecord[]);
      }

      setLoading(false);
    }

    loadRecords();
  }, []);

  const states = useMemo(
    () => ["All", ...Array.from(new Set(records.map((r) => r.State).filter(Boolean)))],
    [records]
  );

  const assignmentTypes = useMemo(
    () => [
      "All",
      ...Array.from(new Set(records.map((r) => r["Assignment Type"]).filter(Boolean))),
    ],
    [records]
  );

  const valueBuckets = useMemo(
    () => [
      "All",
      ...Array.from(new Set(records.map((r) => r["Value Bucket"]).filter(Boolean))),
    ],
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const stateMatch = stateFilter === "All" || r.State === stateFilter;
      const typeMatch =
        typeFilter === "All" || r["Assignment Type"] === typeFilter;
      const valueMatch =
        valueFilter === "All" || r["Value Bucket"] === valueFilter;

      return stateMatch && typeMatch && valueMatch;
    });
  }, [records, stateFilter, typeFilter, valueFilter]);

  const avgGrossFee = avg(filteredRecords.map((r) => Number(r["Fee Total"])));
  const avgTechFee = avg(filteredRecords.map((r) => Number(r["Technology Fees"])));
  const avgNetFee = avg(filteredRecords.map((r) => Number(r["Net Fee"])));
  const avgTurnTime = avg(filteredRecords.map((r) => Number(r["Turn Time (Days)"])));

  const mostCommonType = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredRecords.forEach((r) => {
      const type = r["Assignment Type"] || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    return (
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    );
  }, [filteredRecords]);

  const feeByValueBucket = useMemo(() => {
    const grouped: Record<string, BillingRecord[]> = {};

    filteredRecords.forEach((r) => {
      const bucket = r["Value Bucket"] || "Unknown";
      grouped[bucket] = grouped[bucket] || [];
      grouped[bucket].push(r);
    });

    return Object.entries(grouped).map(([bucket, items]) => ({
      bucket,
      avgGrossFee: Math.round(avg(items.map((r) => Number(r["Fee Total"])))),
      avgNetFee: Math.round(avg(items.map((r) => Number(r["Net Fee"])))),
    }));
  }, [filteredRecords]);

  const feeByType = useMemo(() => {
    const grouped: Record<string, BillingRecord[]> = {};

    filteredRecords.forEach((r) => {
      const type = r["Assignment Type"] || "Unknown";
      grouped[type] = grouped[type] || [];
      grouped[type].push(r);
    });

    return Object.entries(grouped).map(([type, items]) => ({
      type,
      avgFee: Math.round(avg(items.map((r) => Number(r["Fee Total"])))),
    }));
  }, [filteredRecords]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Appraiser Intel
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Market intelligence for residential appraisers.
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600">
            Benchmark appraisal fees, technology fees, net compensation, turn
            times, and assignment trends ahead of the UAD 3.6 transition.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Fee Analytics
            </span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Net Fee Tracking
            </span>
            <span className="rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
              UAD 3.6 Ready
            </span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            {states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {assignmentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            value={valueFilter}
            onChange={(e) => setValueFilter(e.target.value)}
          >
            {valueBuckets.map((bucket) => (
              <option key={bucket}>{bucket}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-slate-600 shadow-sm border border-slate-200">
            Loading appraisal data...
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <StatCard title="Records" value={filteredRecords.length.toString()} />
              <StatCard title="Avg Gross Fee" value={money(avgGrossFee)} />
              <StatCard title="Avg Tech Fee" value={money(avgTechFee)} />
              <StatCard title="Avg Net Fee" value={money(avgNetFee)} />
              <StatCard
                title="Avg Turn Time"
                value={`${avgTurnTime.toFixed(1)} days`}
              />
              <StatCard title="Top Form" value={mostCommonType} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold">
                  Average Fee by Value Bucket
                </h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feeByValueBucket}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgGrossFee" name="Avg Gross Fee" />
                      <Bar dataKey="avgNetFee" name="Avg Net Fee" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="mb-4 text-lg font-semibold">
                  Average Fee by Assignment Type
                </h2>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feeByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgFee"
                        name="Avg Fee"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="mb-4 text-lg font-semibold">Recent Records</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-3 pr-4">File No.</th>
                      <th className="py-3 pr-4">City</th>
                      <th className="py-3 pr-4">State</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Value Bucket</th>
                      <th className="py-3 pr-4">Gross Fee</th>
                      <th className="py-3 pr-4">Tech Fee</th>
                      <th className="py-3 pr-4">Net Fee</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.slice(0, 20).map((r) => (
                      <tr key={r["File No."]} className="border-b">
                        <td className="py-3 pr-4">{r["File No."]}</td>
                        <td className="py-3 pr-4">{r.City}</td>
                        <td className="py-3 pr-4">{r.State}</td>
                        <td className="py-3 pr-4">{r["Assignment Type"]}</td>
                        <td className="py-3 pr-4">{r["Value Bucket"]}</td>
                        <td className="py-3 pr-4">
                          {money(Number(r["Fee Total"]))}
                        </td>
                        <td className="py-3 pr-4">
                          {money(Number(r["Technology Fees"]))}
                        </td>
                        <td className="py-3 pr-4">
                          {money(Number(r["Net Fee"]))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
