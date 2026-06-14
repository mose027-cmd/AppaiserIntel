"use client";

import { useEffect, useMemo, useState } from "react";
import VerifiedAccess from "../../components/VerifiedAccess";
import { createClient } from "@supabase/supabase-js";

type Submission = {
  id: string;
  amc: string | null;
  lender: string | null;
  assignment_type: string | null;
  gross_fee: number | null;
  tech_fee: number | null;
  net_fee: number | null;
  turn_time: number | null;
  revision_rounds: number | null;
  created_at: string;
};

type LenderStats = {
  name: string;
  count: number;
  avgGross: number;
  avgNet: number;
  avgTurn: number;
  avgRevisions: number;
  profitPerDay: number;
  index: number;
  tier: string;
  confidence: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OperationsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "id, amc, lender, assignment_type, gross_fee, tech_fee, net_fee, turn_time, revision_rounds, created_at"
        );

      if (error) {
        console.error("Error loading lender intelligence data:", error);
        setLoading(false);
        return;
      }

      setSubmissions(data || []);
      setLoading(false);
    }

    loadSubmissions();
  }, []);

  const marketAvgNetFee = useMemo(() => {
    const fees = submissions
      .map((item) => Number(item.net_fee || 0))
      .filter((fee) => fee > 0);

    if (fees.length === 0) return 0;

    return fees.reduce((sum, fee) => sum + fee, 0) / fees.length;
  }, [submissions]);

  const marketAvgTurnTime = useMemo(() => {
    const turns = submissions
      .map((item) => Number(item.turn_time || 0))
      .filter((turn) => turn > 0);

    if (turns.length === 0) return 0;

    return turns.reduce((sum, turn) => sum + turn, 0) / turns.length;
  }, [submissions]);

  const marketAvgRevisions = useMemo(() => {
    const revisions = submissions
      .map((item) => Number(item.revision_rounds || 0))
      .filter((revision) => revision >= 0);

    if (revisions.length === 0) return 0;

    return revisions.reduce((sum, revision) => sum + revision, 0) / revisions.length;
  }, [submissions]);

  const lenderStats = useMemo(() => {
    const grouped: Record<string, Submission[]> = {};

    submissions.forEach((item) => {
      const lenderName = item.lender?.trim();

      if (!lenderName) return;

      if (!grouped[lenderName]) {
        grouped[lenderName] = [];
      }

      grouped[lenderName].push(item);
    });

    return Object.entries(grouped)
      .map(([name, items]) => {
        const count = items.length;

        const avgGross =
          items.reduce((sum, item) => sum + Number(item.gross_fee || 0), 0) /
          count;

        const avgNet =
          items.reduce((sum, item) => sum + Number(item.net_fee || 0), 0) /
          count;

        const avgTurn =
          items.reduce((sum, item) => sum + Number(item.turn_time || 0), 0) /
          count;

        const avgRevisions =
          items.reduce(
            (sum, item) => sum + Number(item.revision_rounds || 0),
            0
          ) / count;

        const profitPerDay = avgTurn > 0 ? avgNet / avgTurn : avgNet;

        const index = calculateBenchmarkIndex({
          avgNet,
          avgTurn,
          avgRevisions,
          profitPerDay,
          marketAvgNetFee,
          marketAvgTurnTime,
          marketAvgRevisions,
        });

        return {
          name,
          count,
          avgGross,
          avgNet,
          avgTurn,
          avgRevisions,
          profitPerDay,
          index,
          tier: getBenchmarkTier(index, count),
          confidence: getConfidenceLevel(count),
        };
      })
      .sort((a, b) => b.index - a.index);
  }, [submissions, marketAvgNetFee, marketAvgTurnTime, marketAvgRevisions]);

  const aboveBenchmarkLenders = lenderStats
    .filter(
      (item) =>
        item.tier === "Upper Benchmark" ||
        item.tier === "Above Benchmark"
    )
    .slice(0, 5);

  const developingDatasetLenders = lenderStats
    .filter((item) => item.tier === "Developing Dataset")
    .slice(0, 5);

  if (loading) {
    return (
      <VerifiedAccess>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-slate-600">Loading lender intelligence...</p>
        </div>
      </VerifiedAccess>
    );
  }

  return (
    <VerifiedAccess>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Lender Intelligence
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Lender Benchmark Intelligence
          </h1>

<p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
  Review lender compensation patterns, turn-time patterns,
  revision activity, and dataset confidence across submitted
  appraisal assignments.
</p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <MetricCard
            title="Tracked Lenders"
            value={lenderStats.length.toString()}
            subtitle="Lenders with submitted assignment data"
          />

          <MetricCard
            title="Market Avg Net Fee"
            value={formatCurrency(marketAvgNetFee)}
            subtitle="Average net fee across submitted assignments"
          />

          <MetricCard
            title="Market Avg Turn Time"
            value={`${marketAvgTurnTime.toFixed(1)} days`}
            subtitle="Average completion cycle"
          />

          <MetricCard
            title="Dataset Confidence"
            value={submissions.length >= 25 ? "Moderate Dataset" : "Limited Dataset"}
            subtitle={`${submissions.length} submitted assignments currently contributing to benchmark calculations`}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <LenderListCard
            title="Above Benchmark Cohort"
            subtitle="Lender relationships currently trending above submitted market benchmarks"
            items={aboveBenchmarkLenders}
            emptyMessage="No above-benchmark cohort data available at the current contribution volume."
          />

          <LenderListCard
            title="Developing Dataset Cohort"
            subtitle="Lender relationships with limited submitted data requiring additional contribution volume"
            items={developingDatasetLenders}
            emptyMessage="No developing dataset lender records available yet."
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Lender Scoreboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Lender benchmark positioning based on compensation, turn time,
              revision activity, net profit per day, and dataset confidence.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeader>Lender</TableHeader>
                  <TableHeader>Tier</TableHeader>
                  <TableHeader>Confidence</TableHeader>
                  <TableHeader>Benchmark Index</TableHeader>
                  <TableHeader>Avg Net</TableHeader>
                  <TableHeader>Avg Turn</TableHeader>
                  <TableHeader>Avg Revisions</TableHeader>
                  <TableHeader>Profit / Day</TableHeader>
                  <TableHeader>Count</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {lenderStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No lender data has been submitted yet.
                    </td>
                  </tr>
                ) : (
                  lenderStats.map((item) => (
                    <tr key={item.name}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className={getTierBadgeClass(item.tier)}>
                          {item.tier}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className={getConfidenceBadgeClass(item.confidence)}>
                          {item.confidence}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-slate-950">
                        {item.index}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatCurrency(item.avgNet)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.avgTurn.toFixed(1)} days
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.avgRevisions.toFixed(1)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatCurrency(item.profitPerDay)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </VerifiedAccess>
  );
}

function calculateBenchmarkIndex({
  avgNet,
  avgTurn,
  avgRevisions,
  profitPerDay,
  marketAvgNetFee,
  marketAvgTurnTime,
  marketAvgRevisions,
}: {
  avgNet: number;
  avgTurn: number;
  avgRevisions: number;
  profitPerDay: number;
  marketAvgNetFee: number;
  marketAvgTurnTime: number;
  marketAvgRevisions: number;
}) {
  let index = 50;

  if (marketAvgNetFee > 0) {
    index += ((avgNet - marketAvgNetFee) / marketAvgNetFee) * 35;
  }

  if (marketAvgTurnTime > 0 && avgTurn > 0) {
    index += ((marketAvgTurnTime - avgTurn) / marketAvgTurnTime) * 20;
  }

  if (marketAvgRevisions >= 0) {
    index += (marketAvgRevisions - avgRevisions) * 8;
  }

  index += Math.min(profitPerDay / 25, 15);

  return Math.max(0, Math.min(100, Math.round(index)));
}

function getConfidenceLevel(count: number) {
  if (count >= 10) return "High Confidence Dataset";
  if (count >= 5) return "Moderate Dataset";
  return "Limited Dataset";
}

function getBenchmarkTier(index: number, count: number) {
  if (count < 3) return "Developing Dataset";
  if (index >= 90) return "Upper Benchmark";
  if (index >= 80) return "Above Benchmark";
  if (index >= 60) return "Market Range";
return "Market Review Range";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getConfidenceBadgeClass(confidence: string) {
  if (confidence === "High Confidence Dataset") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (confidence === "Moderate Dataset") {
    return "inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700";
  }

  return "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700";
}

function getTierBadgeClass(tier: string) {
  if (tier === "Upper Benchmark") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
  }

  if (tier === "Above Benchmark") {
    return "inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700";
  }

  if (tier === "Market Range") {
    return "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700";
  }

  if (tier === "Developing Dataset") {
    return "inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700";
  }

  return "inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700";
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function LenderListCard({
  title,
  subtitle,
  items,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  items: LenderStats[];
  emptyMessage: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(item.avgNet)} avg net · {item.avgTurn.toFixed(1)} days
                  </p>
                </div>

                <span className={getTierBadgeClass(item.tier)}>
                  {item.tier}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Benchmark Index</p>
                  <p className="font-bold text-slate-950">{item.index}</p>
                </div>

                <div>
                  <p className="text-slate-500">Profit / Day</p>
                  <p className="font-bold text-slate-950">
                    {formatCurrency(item.profitPerDay)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Count</p>
                  <p className="font-bold text-slate-950">{item.count}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}