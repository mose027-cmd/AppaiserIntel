"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function VerifyPage() {
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function submitVerification() {
    setMessage("");

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    if (!fullName || !state || !licenseNumber || !licenseFile) {
      setMessage("Please complete all fields and upload your license PDF.");
      return;
    }

    const filePath = `${data.user.id}/license-${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("license-pdfs")
      .upload(filePath, licenseFile);

    if (uploadError) {
      console.error(uploadError);
      setMessage("License upload failed.");
      return;
    }

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        state,
        license_number: licenseNumber,
        license_pdf_path: filePath,
        verification_status: "pending",
      });

    if (profileError) {
      console.error(profileError);
      setMessage("Profile submission failed.");
      return;
    }

    setMessage("Verification submitted. Your account is pending review.");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Appraiser Verification</h1>

        <p className="mt-3 text-slate-600">
          Submit your license information to request access to verified
          appraiser analytics.
        </p>

        <div className="mt-8 grid gap-4">
          <input
            placeholder="Full Name"
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="State"
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
          />

          <input
            placeholder="License Number"
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />

          <input
            type="file"
            accept="application/pdf"
            className="rounded-xl border border-slate-300 px-4 py-3"
            onChange={(e) =>
              setLicenseFile(e.target.files?.[0] || null)
            }
          />

          <button
            onClick={submitVerification}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Submit Verification
          </button>

          {message && (
            <p className="text-sm text-slate-600">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}