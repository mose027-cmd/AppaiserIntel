"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Submission = {
  gross_fee: number | null;
  tech_fee: number | null;
  net_fee: number | null;
  turn_time: number | null;
  revision_rounds: number | null;
};

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [total, setTotal] = useState(0);
  const [avgGrossFee, setAvgGrossFee] = useState(0);
  const [avgTechFee, setAvgTechFee] = useState(0);
  const [avgNetFee, setAvgNetFee] = useState(0);
  const [avgTurnTime, setAvgTurnTime] = useState(0);
  const [avgRevisionRounds, setAvgRevisionRounds] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
const storedSession = localStorage.getItem(
  "sb-lyibzziciksphcgrjdgm-auth-token"
);

if (!storedSession) {
  window.location.href = "/login";
  return;
}

const parsedSession = JSON.parse(storedSession);
const user = parsedSession.user;
      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("submissions")
        .select("gross_fee, tech_fee, net_fee, turn_time, revision_rounds")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      const submissions = (data || []) as Submission[];
      setTotal(submissions.length);

      function avg(field: keyof Submission) {
        if (submissions.length === 0) return 0;

        const sum = submissions.reduce((acc, item) => {
          return acc + Number(item[field] || 0);
        }, 0);

        return Math.round(sum / submissions.length);
      }

      setAvgGrossFee(avg("gross_fee"));
      setAvgTechFee(avg("tech_fee"));
      setAvgNetFee(avg("net_fee"));
      setAvgTurnTime(avg("turn_time"));
      setAvgRevisionRounds(avg("revision_rounds"));
    }

    loadDashboard();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              AppraiserIntel Dashboard
            </h1>

            <p className="mt-3 text-slate-600">
              Signed in as {email}
            </p>
          </div>

<div className="flex gap-3">
  <a
    href="/submit"
    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
  >
    Submit Data
  </a>

  <button
    onClick={signOut}
    className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
  >
    Logout
  </button>
</div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Total Submissions</p>
            <p className="mt-2 text-3xl font-bold">{total}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Average Gross Fee</p>
            <p className="mt-2 text-3xl font-bold">${avgGrossFee}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Average Net Fee</p>
            <p className="mt-2 text-3xl font-bold">${avgNetFee}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Average Tech Fee</p>
            <p className="mt-2 text-3xl font-bold">${avgTechFee}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Average Turn Time</p>
            <p className="mt-2 text-3xl font-bold">{avgTurnTime} Days</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Revision Burden</p>
            <p className="mt-2 text-3xl font-bold">
              {avgRevisionRounds} Rounds
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}