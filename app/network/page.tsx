"use client";

import DashboardShell from "../../components/DashboardShell";

const verificationSteps = [
  {
    title: "Identity Details",
    description: "Contributor name, email, and license number are collected for verification.",
  },
  {
    title: "License Documentation",
    description: "A PDF copy of the appraiser license is uploaded for review.",
  },
  {
    title: "Contributor Review",
    description: "Verification confirms appraiser-only access to the intelligence layer.",
  },
];

export default function NetworkPage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Contributor Network
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Verified Contributor Network
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Private appraiser-only intelligence access supported by contributor
            verification, license review, and protected participation standards.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-4">
          <MetricCard title="Verification Status" value="Pending" subtitle="Contributor review stage" />
          <MetricCard title="Access Layer" value="Private" subtitle="Appraiser-only intelligence access" />
          <MetricCard title="License Review" value="Required" subtitle="PDF license verification" />
          <MetricCard title="Contributor Role" value="Verified" subtitle="Network participation standard" />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Contributor Verification
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Verification protects data quality and keeps the intelligence layer
              focused on residential appraisal professionals.
            </p>

            <div className="mt-8 space-y-5">
              <Input label="Full Name" placeholder="Contributor name" />
              <Input label="Email" placeholder="Contributor email" />
              <Input label="License Number" placeholder="Appraiser license number" />

              <div>
                <p className="mb-2 text-sm font-medium text-slate-600">
                  License PDF
                </p>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-950">
                    Upload license documentation
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    PDF upload workflow placeholder for appraiser license review.
                  </p>
                </div>
              </div>

              <button className="rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800">
                Submit Verification Request
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Verification Workflow
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Contributor verification is designed to support trust, quality,
              and private access controls.
            </p>

            <div className="mt-8 space-y-5">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Step {index + 1}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
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

function Input({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>
      <input
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition focus:border-slate-950"
      />
    </div>
  );
}