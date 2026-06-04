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

type AmcStats = {
  name: string;
  count: number;
  avgGross: number;
  avgNet: number;
  avgTurn: number;
  avgRevisions: number;
  profitPerDay: number;
  score: number;
  tier: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CompensationPage() {
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
        console.error("Error loading compensation data:", error);
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

  const amcStats = useMemo(() => {
    const grouped: Record<string, Submission[]> = {};

    submissions.forEach((item) => {
      const amcName = item.amc?.trim();

      if (!amcName) return;

      if (!grouped[amcName]) {
        grouped[amcName] = [];
      }

      grouped[amcName].push(item);
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

        const score = calculateAmcScore({
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
          score,
          tier: getAmcTier(score),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [submissions, marketAvgNetFee, marketAvgTurnTime, marketAvgRevisions]);

  const topAmc = amcStats[0];

  if (loading) {
    return (
      <VerifiedAccess>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-slate-600">Loading compensation intelligence...</p>
        </div>
      </VerifiedAccess>
    );
  }

  return (
    <VerifiedAccess>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            AMC Intelligence
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            AMC Benchmark Intelligence
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Compare AMC fee strength, turn-time behavior, revision burden, and
            operational profitability across submitted appraisal activity.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <MetricCard
            title="Tracked AMCs"
            value={amcStats.length.toString()}
            subtitle="AMCs with submitted assignment data"
          />

          <MetricCard
            title="Market Avg Net Fee"
            value={formatCurrency(marketAvgNetFee)}
            subtitle="Average net fee across all submitted assignments"
          />

          <MetricCard
            title="Market Avg Turn Time"
            value={`${marketAvgTurnTime.toFixed(1)} days`}
            subtitle="Average completion cycle"
          />

          <MetricCard
            title="Top AMC"
            value={topAmc ? topAmc.name : "N/A"}
            subtitle={topAmc ? `${topAmc.tier} · Score ${topAmc.score}` : "No AMC data yet"}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <InsightCard
            title="Fee Strength"
            value={
              topAmc && topAmc.avgNet >= marketAvgNetFee
                ? "Above Market"
                : "Market Developing"
            }
          />

          <InsightCard
            title="Turn Time"
            value={
              topAmc && topAmc.avgTurn <= marketAvgTurnTime
                ? "Faster Than Market"
                : "Market Aligned"
            }
          />

          <InsightCard
            title="Revision Pattern"
            value={
              topAmc && topAmc.avgRevisions <= marketAvgRevisions
                ? "Lower Revision Frequency"
                : "Market Aligned"
            }
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              AMC Scoreboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Ranked AMC performance based on fee strength, turn time, revision
              burden, and net profit per day.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeader>AMC</TableHeader>
                  <TableHeader>Tier</TableHeader>
                  <TableHeader>Score</TableHeader>
                  <TableHeader>Avg Net</TableHeader>
                  <TableHeader>Avg Turn</TableHeader>
                  <TableHeader>Avg Revisions</TableHeader>
                  <TableHeader>Profit / Day</TableHeader>
                  <TableHeader>Count</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {amcStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No AMC data has been submitted yet.
                    </td>
                  </tr>
                ) : (
                  amcStats.map((item) => (
                    <tr key={item.name}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {item.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.tier}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-slate-950">
                        {item.score}
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

function calculateAmcScore({
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
  let score = 50;

  if (marketAvgNetFee > 0) {
    score += ((avgNet - marketAvgNetFee) / marketAvgNetFee) * 35;
  }

  if (marketAvgTurnTime > 0 && avgTurn > 0) {
    score += ((marketAvgTurnTime - avgTurn) / marketAvgTurnTime) * 20;
  }

  if (marketAvgRevisions >= 0) {
    score += (marketAvgRevisions - avgRevisions) * 8;
  }

  score += Math.min(profitPerDay / 25, 15);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getAmcTier(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 80) return "Premium";
  if (score >= 60) return "Average";
  return "Low Value";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
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

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
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