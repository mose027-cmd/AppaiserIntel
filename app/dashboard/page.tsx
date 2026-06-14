"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardShell from "../../components/DashboardShell";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type Submission = {
  id: string;
  amc?: string | null;
  lender?: string | null;
  assignment_type?: string | null;
  gross_fee?: number | null;
  tech_fee?: number | null;
  net_fee?: number | null;
  turn_time?: number | null;
  revision_rounds?: number | null;
  created_at?: string | null;
};

type GroupedClient = {
  name: string;
  type: "AMC" | "Lender" | "Client";
  count: number;
  avgGrossFee: number;
  avgTechFee: number;
  avgNetFee: number;
  avgTurnTime: number;
  avgRevisionRounds: number;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function safeNumber(value: number | null | undefined) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function avg(values: Array<number | null | undefined>) {
  const cleanValues = values.map(safeNumber).filter((value) => value > 0);
  if (!cleanValues.length) return 0;
  return cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length;
}

function pctDifference(value: number, benchmark: number) {
  if (!benchmark) return 0;
  return ((value - benchmark) / benchmark) * 100;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDays(value: number) {
  if (!value) return "—";
  return `${value.toFixed(1)} days`;
}

function normalizeClientName(value?: string | null) {
  if (!value) return "Unspecified";
  return value.trim() || "Unspecified";
}

export default function DashboardPage() {
const supabase = useMemo(
  () =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
  []
);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeClientType, setActiveClientType] = useState<"All" | "AMC" | "Lender">("All");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Unable to verify your login session. Please sign in again.");
        setLoading(false);
        return;
      }

const { data, error } = await supabase
  .from("submissions")
  .select(
    "id, user_id, amc, lender, assignment_type, gross_fee, tech_fee, net_fee, turn_time, revision_rounds, created_at"
  )
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSubmissions(data ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, [supabase]);

  const total = submissions.length;

  const avgGrossFee = useMemo(() => avg(submissions.map((item) => item.gross_fee)), [submissions]);
  const avgTechFee = useMemo(() => avg(submissions.map((item) => item.tech_fee)), [submissions]);
  const avgNetFee = useMemo(() => avg(submissions.map((item) => item.net_fee)), [submissions]);
  const avgTurnTime = useMemo(() => avg(submissions.map((item) => item.turn_time)), [submissions]);
  const avgRevisionRounds = useMemo(() => avg(submissions.map((item) => item.revision_rounds)), [submissions]);

  const totalTechFees = useMemo(
    () => submissions.reduce((sum, item) => sum + safeNumber(item.tech_fee), 0),
    [submissions]
  );

  const amcSubmissions = useMemo(
    () => submissions.filter((item) => normalizeClientName(item.amc) !== "Unspecified"),
    [submissions]
  );

  const lenderSubmissions = useMemo(
    () => submissions.filter((item) => normalizeClientName(item.lender) !== "Unspecified"),
    [submissions]
  );

  const groupedClients = useMemo(() => {
    const groups = new Map<string, GroupedClient & { grossFees: number[]; techFees: number[]; netFees: number[]; turnTimes: number[]; revisions: number[] }>();

    function addClient(name: string, type: "AMC" | "Lender", item: Submission) {
      const normalizedName = normalizeClientName(name);
      if (normalizedName === "Unspecified") return;

      const key = `${type}:${normalizedName}`;
      const existing = groups.get(key) ?? {
        name: normalizedName,
        type,
        count: 0,
        avgGrossFee: 0,
        avgTechFee: 0,
        avgNetFee: 0,
        avgTurnTime: 0,
        avgRevisionRounds: 0,
        grossFees: [],
        techFees: [],
        netFees: [],
        turnTimes: [],
        revisions: [],
      };

      existing.count += 1;
      existing.grossFees.push(safeNumber(item.gross_fee));
      existing.techFees.push(safeNumber(item.tech_fee));
      existing.netFees.push(safeNumber(item.net_fee));
      existing.turnTimes.push(safeNumber(item.turn_time));
      existing.revisions.push(safeNumber(item.revision_rounds));

      groups.set(key, existing);
    }

    submissions.forEach((item) => {
      addClient(item.amc ?? "", "AMC", item);
      addClient(item.lender ?? "", "Lender", item);
    });

    return Array.from(groups.values())
      .map((group) => ({
        name: group.name,
        type: group.type,
        count: group.count,
        avgGrossFee: avg(group.grossFees),
        avgTechFee: avg(group.techFees),
        avgNetFee: avg(group.netFees),
        avgTurnTime: avg(group.turnTimes),
        avgRevisionRounds: avg(group.revisions),
      }))
      .sort((a, b) => b.avgNetFee - a.avgNetFee);
  }, [submissions]);

  const visibleClients = useMemo(() => {
    if (activeClientType === "All") return groupedClients;
    return groupedClients.filter((client) => client.type === activeClientType);
  }, [activeClientType, groupedClients]);

  const topClients = visibleClients.slice(0, 6);

  const strongestClient = topClients[0];
  const lowestRevisionClient = [...visibleClients]
    .filter((client) => client.count >= 1)
    .sort((a, b) => a.avgRevisionRounds - b.avgRevisionRounds)[0];

  const assignmentMix = useMemo(() => {
    const groups = new Map<string, number>();
    submissions.forEach((item) => {
      const key = item.assignment_type?.trim() || "Unspecified";
      groups.set(key, (groups.get(key) ?? 0) + 1);
    });
    return Array.from(groups.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [submissions]);

  const recentSubmissions = submissions.slice(0, 6);

return (
<DashboardShell>
      <div className="mx-auto max-w-7xl">
<section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
  <div className="grid grid-cols-12 gap-6 items-start">

    {/* LEFT SIDE */}
    <div className="col-span-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
        Appraiser Intel
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-950 leading-tight">
        Operational benchmarking intelligence for appraisal firms
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600 max-w-2xl">
        Analyze compensation patterns, turn-time behavior, revision burden, and lender/AMC activity across submitted appraisal data.
      </p>
    </div>

    {/* RIGHT SIDE */}
    <div className="col-span-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500">Data Status</p>
        <p className="mt-1 text-lg font-bold text-slate-950">
          {loading ? "Loading" : `${total} submissions`}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Private dataset tied to verified contributor accounts
        </p>
      </div>
    </div>

  </div>
</section>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Avg Gross Fee" value={money.format(avgGrossFee)} helper="Before technology/upload fees" />
          <MetricCard label="Avg Tech Fee" value={money.format(avgTechFee)} helper={`${money.format(totalTechFees)} total absorbed`} />
          <MetricCard label="Avg Net Fee" value={money.format(avgNetFee)} helper="True fee after tech costs" />
          <MetricCard label="Avg Turn Time" value={formatDays(avgTurnTime)} helper="Assignment to delivery" />
          <MetricCard label="Avg Revisions" value={avgRevisionRounds ? avgRevisionRounds.toFixed(1) : "—"} helper="Rounds per assignment" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3 gap-4">
          <InsightCard
            title="Client Compensation Signal"
            headline={strongestClient ? `${strongestClient.name}` : "Insufficient Data"}
            body={
              strongestClient
                ? `${strongestClient.type} relationship currently shows the strongest average net fee at ${money.format(strongestClient.avgNetFee)} across ${strongestClient.count} record${strongestClient.count === 1 ? "" : "s"}.`
                : "Add more records to identify lender and AMC compensation patterns."
            }
          />

          <InsightCard
            title="Operational Friction Signal"
            headline={lowestRevisionClient ? `${lowestRevisionClient.name}` : "Insufficient Data"}
            body={
              lowestRevisionClient
                ? `${lowestRevisionClient.type} relationship currently shows the lowest average revision burden at ${lowestRevisionClient.avgRevisionRounds.toFixed(1)} rounds per file.`
                : "Revision burden will appear once records include revision round data."
            }
          />

          <InsightCard
            title="Data Momentum"
            headline={`${total}`}
            body="Each new submission improves the benchmark value of the platform and strengthens future lender/AMC analytics."
          />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Compensation & Operational Intelligence
              </h2>
              <p className="mt-1 text-sm text-slate-600">
Aggregated contributor benchmarks across compensation, technology fees, turn cycles, and revision activity.
              </p>
            </div>

            <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
              {(["All", "AMC", "Lender"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveClientType(type)}
                  className={`rounded-xl px-4 py-2 transition ${
                    activeClientType === type
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Files</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Tech</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Turn</th>
                  <th className="px-4 py-3 text-right">Revisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {topClients.length ? (
                  topClients.map((client) => (
                    <tr key={`${client.type}-${client.name}`} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-950">{client.name}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {client.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-700">{client.count}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{money.format(client.avgGrossFee)}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{money.format(client.avgTechFee)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-950">{money.format(client.avgNetFee)}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{formatDays(client.avgTurnTime)}</td>
                      <td className="px-4 py-4 text-right text-slate-700">{client.avgRevisionRounds ? client.avgRevisionRounds.toFixed(1) : "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                      No lender or AMC records available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Residential Valuation Distribution</h2>
            <p className="mt-1 text-sm text-slate-600">Reported assignment category distribution across contributed intelligence points.</p>

            <div className="mt-6 space-y-4">
              {assignmentMix.length ? (
                assignmentMix.map((item) => {
                  const width = total ? Math.max((item.count / total) * 100, 8) : 0;

                  return (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">Assignment type data will appear here once submissions are added.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Benchmark Indicators</h2>
            <p className="mt-1 text-sm text-slate-600">Private operational indicators derived from contributed appraisal activity.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <BenchmarkCard
                label="Net vs Gross Capture"
                value={avgGrossFee ? `${((avgNetFee / avgGrossFee) * 100).toFixed(1)}%` : "—"}
                detail="Measures how much of the gross fee remains after tech fees."
              />
              <BenchmarkCard
                label="AMC Share"
                value={total ? `${((amcSubmissions.length / total) * 100).toFixed(1)}%` : "—"}
                detail="Percent of records with an AMC relationship."
              />
              <BenchmarkCard
                label="Lender Share"
                value={total ? `${((lenderSubmissions.length / total) * 100).toFixed(1)}%` : "—"}
                detail="Percent of records with a lender relationship."
              />
              <BenchmarkCard
                label="Revision Load"
                value={avgRevisionRounds ? avgRevisionRounds.toFixed(1) : "—"}
                detail="Average number of revision rounds per assignment."
              />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Recent Intelligence Contributions</h2>
              <p className="mt-1 text-sm text-slate-600">Most recent contributed records supporting private benchmark analytics.</p>
            </div>
            <p className="text-sm text-slate-500">Contributor intelligence view</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentSubmissions.length ? (
              recentSubmissions.map((item) => {
                const client = normalizeClientName(item.lender) !== "Unspecified" ? item.lender : item.amc;
                const clientType = normalizeClientName(item.lender) !== "Unspecified" ? "Lender" : "AMC";
                const netFee = safeNumber(item.net_fee);
                const grossFee = safeNumber(item.gross_fee);
                const netDifference = pctDifference(netFee, avgNetFee);

                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{normalizeClientName(client)}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{clientType}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {item.assignment_type || "File"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Gross</p>
                        <p className="font-semibold text-slate-950">{money.format(grossFee)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Net</p>
                        <p className="font-semibold text-slate-950">{money.format(netFee)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Turn</p>
                        <p className="font-semibold text-slate-950">{formatDays(safeNumber(item.turn_time))}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Vs Avg Net</p>
                        <p className="font-semibold text-slate-950">{formatPercent(netDifference)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                No submissions yet. Once records are added, this dashboard will populate automatically.
              </div>
            )}
          </div>
        </section>
      </div>
</DashboardShell>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function InsightCard({ title, headline, body }: { title: string; headline: string; body: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{title}</p>
      <h3 className="mt-3 text-2xl font-bold text-slate-950">{headline}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function BenchmarkCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}
