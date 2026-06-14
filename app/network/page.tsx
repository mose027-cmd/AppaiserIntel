"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardShell from "../../components/DashboardShell";

type VerificationStatus = "pending" | "verified" | "rejected" | "not_submitted";

const verificationSteps = [
  {
    title: "Identity Details",
    description:
      "Contributor name, email, and license number are collected for verification.",
  },
  {
    title: "License Documentation",
    description:
      "A PDF copy of the appraiser license is uploaded for review.",
  },
  {
    title: "Contributor Review",
    description:
      "Verification confirms appraiser-only access to the intelligence layer.",
  },
];

export default function NetworkPage() {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("not_submitted");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    licenseNumber: "",
  });

const [licenseFile, setLicenseFile] = useState<File | null>(null);
const [submissionCount, setSubmissionCount] = useState(0);
const [amcCoverage, setAmcCoverage] = useState(0);
const [lenderCoverage, setLenderCoverage] = useState(0);
const [assignmentCoverage, setAssignmentCoverage] = useState(0);

useEffect(() => {
    async function loadDatasetCoverage() {
      const { data, error } = await supabase
        .from("submissions")
        .select("amc, lender, assignment_type");

      if (error) {
        console.error("Error loading dataset coverage:", error);
        return;
      }

      const submissions = data || [];

      setSubmissionCount(submissions.length);

      setAmcCoverage(
        new Set(
          submissions
            .map((item) => item.amc?.trim())
            .filter(Boolean)
        ).size
      );

      setLenderCoverage(
        new Set(
          submissions
            .map((item) => item.lender?.trim())
            .filter(Boolean)
        ).size
      );

      setAssignmentCoverage(
        new Set(
          submissions
            .map((item) => item.assignment_type?.trim())
            .filter(Boolean)
        ).size
      );
    }

    async function loadVerificationStatus() {
      setStatusLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setVerificationStatus("not_submitted");
        setStatusLoading(false);
        return;
      }

      const { data } = await supabase
        .from("verification_requests")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setVerificationStatus(
        (data?.status as VerificationStatus) || "not_submitted"
      );

      setStatusLoading(false);
    }

loadVerificationStatus();
    loadDatasetCoverage();
  }, [supabase]);

  async function handleSubmit() {
    try {
      setLoading(true);
      setSuccessMessage("");

      if (
        !formData.fullName ||
        !formData.email ||
        !formData.licenseNumber ||
        !licenseFile
      ) {
        alert("Please complete all fields and upload your license PDF.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User session not found.");
        return;
      }

      const filePath = `${user.id}/${Date.now()}-${licenseFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("license-pdfs")
        .upload(filePath, licenseFile);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { error: dbError } = await supabase
        .from("verification_requests")
        .insert([
          {
            user_id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            license_number: formData.licenseNumber,
            license_file_path: filePath,
            status: "pending",
          },
        ]);

      if (dbError) {
        alert(dbError.message);
        return;
      }

      setSuccessMessage("Verification request submitted successfully.");
      setVerificationStatus("pending");

      setFormData({
        fullName: "",
        email: "",
        licenseNumber: "",
      });

      setLicenseFile(null);
    } finally {
      setLoading(false);
    }
  }

  const displayStatus = statusLoading
    ? "Loading"
    : verificationStatus === "not_submitted"
    ? "Not Submitted"
    : verificationStatus === "verified"
    ? "Verified"
    : verificationStatus === "rejected"
    ? "Rejected"
    : "Pending";

  const statusSubtitle =
    verificationStatus === "verified"
      ? "Contributor verification approved"
      : verificationStatus === "rejected"
      ? "Contributor verification requires follow-up"
      : verificationStatus === "pending"
      ? "Contributor review stage"
      : "Verification request not yet submitted";

  const contributorRole =
    verificationStatus === "verified"
      ? "Verified Contributor"
      : verificationStatus === "pending"
      ? "Pending Contributor"
      : verificationStatus === "rejected"
      ? "Review Required"
      : "Unverified Contributor";

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
  <MetricCard
    title="Submitted Assignments"
    value={submissionCount.toString()}
    subtitle="Contributor intelligence records"
  />

  <MetricCard
    title="AMC Coverage"
    value={amcCoverage.toString()}
    subtitle="Distinct AMC relationships"
  />

  <MetricCard
    title="Lender Coverage"
    value={lenderCoverage.toString()}
    subtitle="Distinct lender relationships"
  />

  <MetricCard
    title="Assignment Coverage"
    value={assignmentCoverage.toString()}
    subtitle="Assignment types represented"
  />
</section>

        <section className="grid gap-6 md:grid-cols-4">
          <MetricCard
            title="Verification Status"
            value={displayStatus}
            subtitle={statusSubtitle}
          />

          <MetricCard
            title="Access Layer"
            value={
              verificationStatus === "verified"
                ? "Enabled"
                : "Limited"
            }
            subtitle="Appraiser-only intelligence access"
          />

          <MetricCard
            title="License Review"
            value={
              verificationStatus === "verified"
                ? "Complete"
                : verificationStatus === "pending"
                ? "In Review"
                : "Required"
            }
            subtitle="PDF license verification"
          />

          <MetricCard
            title="Contributor Role"
            value={contributorRole}
            subtitle="Network participation standard"
          />
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

            {verificationStatus === "verified" ? (
              <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  Verified Contributor
                </p>

                <h3 className="mt-3 text-3xl font-bold text-slate-950">
                  Verification Approved
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your contributor verification has been approved. Private
                  intelligence access is enabled for this account.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                <Input
                  label="Full Name"
                  placeholder="Contributor name"
                  value={formData.fullName}
                  onChange={(value) =>
                    setFormData({ ...formData, fullName: value })
                  }
                />

                <Input
                  label="Email"
                  placeholder="Contributor email"
                  value={formData.email}
                  onChange={(value) =>
                    setFormData({ ...formData, email: value })
                  }
                />

                <Input
                  label="License Number"
                  placeholder="Appraiser license number"
                  value={formData.licenseNumber}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      licenseNumber: value,
                    })
                  }
                />

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600">
                    License PDF
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setLicenseFile(e.target.files?.[0] || null)
                    }
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-5 py-4"
                  />
                </div>

                {successMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                    {successMessage}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="rounded-2xl bg-slate-950 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Verification Request"}
                </button>
              </div>
            )}
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
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition focus:border-slate-950"
      />
    </div>
  );
}