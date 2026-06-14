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

const assignmentTypes = [
  "1004 URAR",
  "1004 FHA",
  "1004 VA",
  "1004 Desktop",
  "1004 Hybrid",
  "1004D Final",
  "1073 Condo",
  "1025 Multi-Family",
  "Complex Assignment",
  "Other",
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
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    amc: "",
    lender: "",
    assignmentType: "",
    grossFee: "",
    techFee: "",
    turnTime: "",
    revisionRounds: "",
  });

  const netFee = Number(formData.grossFee || 0) - Number(formData.techFee || 0);

  function validateStep() {
    setErrorMessage("");

    if (step === 1) {
      if (!formData.amc.trim() && !formData.lender.trim()) {
        setErrorMessage("Please enter either an AMC or lender.");
        return false;
      }

      if (!formData.assignmentType) {
        setErrorMessage("Please select an assignment type.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.grossFee || Number(formData.grossFee) <= 0) {
        setErrorMessage("Please enter a valid gross fee.");
        return false;
      }

      if (Number(formData.techFee || 0) < 0) {
        setErrorMessage("Technology fee cannot be negative.");
        return false;
      }

      if (Number(formData.techFee || 0) >= Number(formData.grossFee)) {
        setErrorMessage("Technology fee must be less than the gross fee.");
        return false;
      }

      if (netFee <= 0) {
        setErrorMessage("Net compensation must be greater than zero.");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.turnTime || Number(formData.turnTime) <= 0) {
        setErrorMessage("Please enter a valid turn time.");
        return false;
      }

      if (formData.revisionRounds === "" || Number(formData.revisionRounds) < 0) {
        setErrorMessage("Please enter revision rounds. Use 0 if none.");
        return false;
      }
    }

    return true;
  }

  function handleContinue() {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  }

  async function handleSubmit() {
    if (!validateStep()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("User session not found. Please log in again.");
      return;
    }

    const { error } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        amc: formData.amc.trim(),
        lender: formData.lender.trim(),
        assignment_type: formData.assignmentType,
        gross_fee: Number(formData.grossFee),
        tech_fee: Number(formData.techFee || 0),
        net_fee: Number(netFee),
        turn_time: Number(formData.turnTime),
        revision_rounds: Number(formData.revisionRounds),
      },
    ]);

    if (error) {
      setErrorMessage(error.message);
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
    setErrorMessage("");
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
            Contribute operational benchmarking and compensation intelligence to
            the private contributor network.
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

                  <p className="mt-2 text-sm font-semibold">{item}</p>
                </div>
              );
            })}
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Assignment Context"
                title="Assignment Information"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="AMC"
                  value={formData.amc}
                  onChange={(value) => setFormData({ ...formData, amc: value })}
                />

                <Input
                  label="Lender"
                  value={formData.lender}
                  onChange={(value) =>
                    setFormData({ ...formData, lender: value })
                  }
                />

                <Select
                  label="Assignment Type"
                  value={formData.assignmentType}
                  options={assignmentTypes}
                  onChange={(value) =>
                    setFormData({ ...formData, assignmentType: value })
                  }
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Compensation"
                title="Compensation Intelligence"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Gross Fee"
                  type="number"
                  value={formData.grossFee}
                  onChange={(value) =>
                    setFormData({ ...formData, grossFee: value })
                  }
                />

                <Input
                  label="Technology Fee"
                  type="number"
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
              <SectionHeading
                eyebrow="Operational Metrics"
                title="Workflow Benchmarking"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Turn Time (Days)"
                  type="number"
                  value={formData.turnTime}
                  onChange={(value) =>
                    setFormData({ ...formData, turnTime: value })
                  }
                />

                <Input
                  label="Revision Rounds"
                  type="number"
                  value={formData.revisionRounds}
                  onChange={(value) =>
                    setFormData({ ...formData, revisionRounds: value })
                  }
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <SectionHeading eyebrow="Final Review" title="Review Contribution" />

              <div className="grid gap-6 md:grid-cols-2">
                <ReviewCard title="AMC" value={formData.amc} />
                <ReviewCard title="Lender" value={formData.lender} />
                <ReviewCard title="Assignment Type" value={formData.assignmentType} />
                <ReviewCard title="Gross Fee" value={`$${formData.grossFee || 0}`} />
                <ReviewCard title="Tech Fee" value={`$${formData.techFee || 0}`} />
                <ReviewCard title="Net Compensation" value={`$${netFee.toFixed(0)}`} />
                <ReviewCard title="Turn Time" value={`${formData.turnTime} Days`} />
                <ReviewCard title="Revision Rounds" value={formData.revisionRounds} />
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => {
                setErrorMessage("");
                setStep((prev) => Math.max(prev - 1, 1));
              }}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleContinue}
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

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-slate-950">{title}</h2>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>

      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition focus:border-slate-950"
      />
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition focus:border-slate-950"
      >
        <option value="">Select assignment type</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-2xl font-bold text-slate-950">
        {value || "—"}
      </p>
    </div>
  );
}