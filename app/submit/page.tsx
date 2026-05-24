"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SubmitPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amc: "",
    lender: "",
    assignment_type: "",
    gross_fee: "",
    tech_fee: "",
    net_fee: "",
    turn_time: "",
    revision_rounds: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        amc: formData.amc,
        lender: formData.lender,
        assignment_type: formData.assignment_type,
        gross_fee: Number(formData.gross_fee),
        tech_fee: Number(formData.tech_fee),
        net_fee: Number(formData.net_fee),
        turn_time: Number(formData.turn_time),
        revision_rounds: Number(formData.revision_rounds),
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Submission added successfully.");

    setFormData({
      amc: "",
      lender: "",
      assignment_type: "",
      gross_fee: "",
      tech_fee: "",
      net_fee: "",
      turn_time: "",
      revision_rounds: "",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">
          Submit Assignment Data
        </h1>

        <p className="mb-8 text-slate-600">
          Contribute anonymized operational benchmark data.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="AMC Name"
            value={formData.amc}
            onChange={(e) =>
              setFormData({ ...formData, amc: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            placeholder="Lender"
            value={formData.lender}
            onChange={(e) =>
              setFormData({ ...formData, lender: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <select
            value={formData.assignment_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                assignment_type: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          >
            <option value="">Assignment Type</option>
            <option value="URAR">URAR</option>
            <option value="1004D">1004D / Final</option>
            <option value="Desktop">Desktop</option>
            <option value="Hybrid">Hybrid</option>
            <option value="FHA">FHA</option>
            <option value="VA">VA</option>
          </select>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="number"
              placeholder="Gross Fee"
              value={formData.gross_fee}
              onChange={(e) =>
                setFormData({ ...formData, gross_fee: e.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Tech Fee"
              value={formData.tech_fee}
              onChange={(e) =>
                setFormData({ ...formData, tech_fee: e.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Net Fee"
              value={formData.net_fee}
              onChange={(e) =>
                setFormData({ ...formData, net_fee: e.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="number"
              placeholder="Turn Time (Days)"
              value={formData.turn_time}
              onChange={(e) =>
                setFormData({ ...formData, turn_time: e.target.value })
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Revision Rounds"
              value={formData.revision_rounds}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  revision_rounds: e.target.value,
                })
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            {loading ? "Submitting..." : "Submit Assignment Data"}
          </button>
        </form>
      </div>
    </main>
  );
}
