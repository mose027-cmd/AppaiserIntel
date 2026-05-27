"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardShell from "../../components/DashboardShell";

const steps = [
  "Assignment Context",
  "Compensation",
  "Operational Metrics",
  "Review",
];

export default function SubmitPage() {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    amc: "",
    lender: "",
    assignmentType: "",
    grossFee: "",
    techFee: "",
    turnTime: "",
    revisionRounds: "",
  });

  const netFee =
    Number(formData.grossFee || 0) -
    Number(formData.techFee || 0);

  async function handleSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User session not found.");
      return;
    }

    const { error } = await supabase
      .from("submissions")
      .insert([
        {
          user_id: user.id,
          amc: formData.amc,
          lender: formData.lender,
          assignment_type: formData.assignmentType,
          gross_fee: Number(formData.grossFee),
          tech_fee: Number(formData.techFee),
          net_fee: Number(netFee),
          turn_time: Number(formData.turnTime),
          revision_rounds: Number(formData.revisionRounds),
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Contribution submitted successfully.");

    setFormData({
      amc: "",
      lender: "",
      assignmentType: "",
      grossFee: "",
      techFee: "",
      turnTime: "",
      revisionRounds: "",
    });

    setStep(1);
  }

  return (
    <DashboardShell>

      <div className="mx-auto max-w-5xl space-y-8">

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Contributor Workflow
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Submit Intelligence
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Contribute operational benchmarking and compensation intelligence
            to the private contributor network.
          </p>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="grid gap-4 md:grid-cols-4">

            {steps.map((item, index) => {
              const active = step === index + 1;

              return (
                <div
                  key={item}
                  className={`rounded-2xl border p-5 transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide">
                    Step {index + 1}
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    {item}
                  </p>
                </div>
              );
            })}

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">

          {step === 1 && (
            <div className="space-y-6">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Assignment Context
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Assignment Information
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <Input
                  label="AMC"
                  value={formData.amc}
                  onChange={(value) =>
                    setFormData({ ...formData, amc: value })
                  }
                />

                <Input
                  label="Lender"
                  value={formData.lender}
                  onChange={(value) =>
                    setFormData({ ...formData, lender: value })
                  }
                />

                <Input
                  label="Assignment Type"
                  value={formData.assignmentType}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      assignmentType: value,
                    })
                  }
                />

              </div>

            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Compensation
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Compensation Intelligence
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <Input
                  label="Gross Fee"
                  value={formData.grossFee}
                  onChange={(value) =>
                    setFormData({ ...formData, grossFee: value })
                  }
                />

                <Input
                  label="Technology Fee"
                  value={formData.techFee}
                  onChange={(value) =>
                    setFormData({ ...formData, techFee: value })
                  }
                />

              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">

                <p className="text-sm text-slate-500">
                  Calculated Net Compensation
                </p>

                <p className="mt-3 text-5xl font-bold text-slate-950">
                  ${netFee.toFixed(0)}
                </p>

              </div>

            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Operational Metrics
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Workflow Benchmarking
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <Input
                  label="Turn Time (Days)"
                  value={formData.turnTime}
                  onChange={(value) =>
                    setFormData({ ...formData, turnTime: value })
                  }
                />

                <Input
                  label="Revision Rounds"
                  value={formData.revisionRounds}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      revisionRounds: value,
                    })
                  }
                />

              </div>

            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Final Review
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Review Contribution
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <ReviewCard
                  title="AMC"
                  value={formData.amc}
                />

                <ReviewCard
                  title="Lender"
                  value={formData.lender}
                />

                <ReviewCard
                  title="Assignment Type"
                  value={formData.assignmentType}
                />

                <ReviewCard
                  title="Net Compensation"
                  value={`$${netFee.toFixed(0)}`}
                />

                <ReviewCard
                  title="Turn Time"
                  value={`${formData.turnTime} Days`}
                />

                <ReviewCard
                  title="Revision Rounds"
                  value={formData.revisionRounds}
                />

              </div>

            </div>
          )}

          <div className="mt-10 flex items-center justify-between">

            <button
              onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((prev) => prev + 1)}
                className="rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="rounded-2xl bg-blue-700 px-6 py-3 font-medium text-white transition hover:bg-blue-800"
              >
                Submit Intelligence
              </button>
            )}

          </div>

        </section>

      </div>

    </DashboardShell>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <p className="mb-2 text-sm font-medium text-slate-600">
        {label}
      </p>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition focus:border-slate-950"
      />

    </div>
  );
}

function ReviewCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value || "—"}
      </p>

    </div>
  );
}