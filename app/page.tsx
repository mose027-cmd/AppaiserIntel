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

  const [showForm, setShowForm] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    amc: "",
    assignmentType: "",
    valueBucket: "",
    grossFee: "",
    techFee: "",
    netFee: "",
    turnTime: "",
  });
async function handleSubmitRecord() {
if (
  !formData.city ||
  !formData.state ||
  !formData.assignmentType ||
  !formData.valueBucket ||
  !formData.grossFee
) {
  alert("Please complete City, State, Assignment Type, Value Bucket, and Gross Fee.");
  return;
}
  const grossFee = Number(formData.grossFee) || 0;
  const techFee = Number(formData.techFee) || 0;
  const netFee = formData.netFee ? Number(formData.netFee) : grossFee - techFee;

  const { error } = await supabase.from("billing_records").insert([
    {
      "File No.": `community-${Date.now()}`,
      City: formData.city,
      State: formData.state,
      Zip: "",
      "Appraised Value": null,
      "Value Bucket": formData.valueBucket,
      "Major Form": formData.assignmentType,
      "Assignment Type": formData.assignmentType,
      "Fee Total": grossFee,
      "Technology Fees": techFee,
      "Net Fee": netFee,
      "Inspection Date": "",
      "Delivered Date": "",
      "Due Date": "",
      "Turn Time (Days)": Number(formData.turnTime) || 0,
    },
  ]);
if (error) {
  console.error(error);
  alert("Submission failed.");
} else {
setSuccessMessage("Record submitted successfully.");

  setFormData({
    city: "",
    state: "",
    assignmentType: "",
    valueBucket: "",
    grossFee: "",
    techFee: "",
    netFee: "",
    turnTime: "",
  });
setTimeout(() => {
  setSuccessMessage("");
}, 3000);
  setShowForm(false);

}

  setRecords((current) => [
    {
      "File No.": `community-${Date.now()}`,
      City: formData.city,
      State: formData.state,
      Zip: "",
      "Appraised Value": null,
      "Value Bucket": formData.valueBucket,
      "Major Form": formData.assignmentType,
      "Assignment Type": formData.assignmentType,
      "Fee Total": grossFee,
      "Technology Fees": techFee,
      "Net Fee": netFee,
      "Inspection Date": "",
      "Delivered Date": "",
      "Due Date": "",
      "Turn Time (Days)": Number(formData.turnTime) || 0,
    },
    ...current,
  ]);

  setFormData({
    city: "",
    state: "",
    assignmentType: "",
    valueBucket: "",
    grossFee: "",
    techFee: "",
    netFee: "",
    turnTime: "",
  });

  setShowForm(false);
}
  useEffect(() => {
    async function loadRecords() {
      const { data, error } = await supabase.from("billing_records").select("*");

      if (error) {
        console.error(error);
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
      return (
        (stateFilter === "All" || r.State === stateFilter) &&
        (typeFilter === "All" || r["Assignment Type"] === typeFilter) &&
        (valueFilter === "All" || r["Value Bucket"] === valueFilter)
      );
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

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
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
{successMessage && (
  <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
    {successMessage}
  </div>
)}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
            Appraiser Intel
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Market intelligence for residential appraisers.
          </h1>

          <p className="mt-4 max-w-3xl text-slate-600">
            Benchmark appraisal fees, technology fees, net compensation, and turn times ahead
            of the UAD 3.6 transition.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Submit Appraisal Data</h2>

              <p className="mt-2 text-slate-600">
                Contribute anonymous fee and turn-time data to improve appraisal market
                transparency ahead of UAD 3.6.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Submit Data
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Submit Appraisal Record</h2>

              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
  placeholder="AMC / Lender"
  className="rounded-xl border border-slate-300 px-4 py-3"
  value={formData.amc}
  onChange={(e) =>
    setFormData({ ...formData, amc: e.target.value })
  }
/>
<input
  placeholder="City"
  className="rounded-xl border border-slate-300 px-4 py-3"
  value={formData.city}
  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
/>
<select
  className="rounded-xl border border-slate-300 px-4 py-3"
  value={formData.state}
  onChange={(e) =>
    setFormData({ ...formData, state: e.target.value })
  }
>
  <option value="">Select State</option>
  <option value="OH">OH</option>
  <option value="KY">KY</option>
  <option value="IN">IN</option>
</select>

<select
  className="rounded-xl border border-slate-300 px-4 py-3"
  value={formData.assignmentType}
  onChange={(e) =>
    setFormData({ ...formData, assignmentType: e.target.value })
  }
>
  <option value="">Select Assignment Type</option>
  <option value="1004 URAR">1004 URAR</option>
  <option value="1004D / Final">1004D / Final</option>
  <option value="Desktop">Desktop</option>
  <option value="Hybrid">Hybrid</option>
  <option value="Multi-Family">Multi-Family</option>
  <option value="Land">Land</option>
  <option value="FHA">FHA</option>
  <option value="VA">VA</option>
  <option value="Jumbo">Jumbo</option>
  <option value="Complex">Complex</option>
</select>

<select
  className="rounded-xl border border-slate-300 px-4 py-3"
  value={formData.valueBucket}
  onChange={(e) =>
    setFormData({ ...formData, valueBucket: e.target.value })
  }
>
  <option value="">Select Value Bucket</option>
  <option value="<250K">&lt;250K</option>
  <option value="250K-500K">250K-500K</option>
  <option value="500K-750K">500K-750K</option>
  <option value="750K-1M">750K-1M</option>
  <option value="1M+">1M+</option>
</select>

              <input
                placeholder="Gross Fee"
                className="rounded-xl border border-slate-300 px-4 py-3"
                value={formData.grossFee}
                onChange={(e) => setFormData({ ...formData, grossFee: e.target.value })}
              />

              <input
                placeholder="Tech Fee"
                className="rounded-xl border border-slate-300 px-4 py-3"
                value={formData.techFee}
                onChange={(e) => setFormData({ ...formData, techFee: e.target.value })}
              />

<div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
  <p className="text-sm text-slate-500">
    Net Fee
  </p>

  <p className="mt-1 text-lg font-semibold text-slate-900">
    {money(
      (Number(formData.grossFee) || 0) -
      (Number(formData.techFee) || 0)
    )}
  </p>
</div>

              <input
                placeholder="Turn Time (Days)"
                className="rounded-xl border border-slate-300 px-4 py-3"
                value={formData.turnTime}
                onChange={(e) => setFormData({ ...formData, turnTime: e.target.value })}
              />
            </div>

<button
  onClick={handleSubmitRecord}
  className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
>
              Submit Record
            </button>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
<div className="md:col-span-3 flex items-center justify-between">
  <p className="text-sm text-slate-500">
    {filteredRecords.length} records found
  </p>
</div>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            Loading data...
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <StatCard title="Records" value={filteredRecords.length.toString()} />
              <StatCard title="Avg Gross Fee" value={money(avgGrossFee)} />
              <StatCard title="Avg Tech Fee" value={money(avgTechFee)} />
              <StatCard title="Avg Net Fee" value={money(avgNetFee)} />
              <StatCard title="Avg Turn Time" value={`${avgTurnTime.toFixed(1)} days`} />
              <StatCard title="Top Form" value={mostCommonType} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Average Fee by Value Bucket</h2>

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

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Recent Records</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-3 pr-4">City</th>
                      <th className="py-3 pr-4">State</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Value Bucket</th>
                      <th className="py-3 pr-4">Gross Fee</th>
                      <th className="py-3 pr-4">Tech Fee</th>
                      <th className="py-3 pr-4">Net Fee</th>
                      <th className="py-3 pr-4">Turn Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.slice(0, 20).map((r, index) => (
                      <tr key={`${r.City}-${r.State}-${index}`} className="border-b">
                        <td className="py-3 pr-4">{r.City}</td>
                        <td className="py-3 pr-4">{r.State}</td>
                        <td className="py-3 pr-4">{r["Assignment Type"]}</td>
                        <td className="py-3 pr-4">{r["Value Bucket"]}</td>
                        <td className="py-3 pr-4">{money(Number(r["Fee Total"]))}</td>
                        <td className="py-3 pr-4">
                          {money(Number(r["Technology Fees"]))}
                        </td>
                        <td className="py-3 pr-4">{money(Number(r["Net Fee"]))}</td>
                        <td className="py-3 pr-4">
                          {Number(r["Turn Time (Days)"]).toFixed(1)} days
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
