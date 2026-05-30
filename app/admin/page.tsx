"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardShell from "../../components/DashboardShell";

type VerificationRequest = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  license_number: string;
  license_file_path: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("verification_requests")
        .select(
          "id, user_id, full_name, email, license_number, license_file_path, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setRequests(data || []);
      setLoading(false);
    }

    loadRequests();
  }, [supabase]);

  async function viewLicense(filePath: string) {
    const { data, error } = await supabase.storage
      .from("license-pdfs")
      .createSignedUrl(filePath, 60);

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  }

  async function updateStatus(
    id: string,
    status: "verified" | "rejected"
  ) {
    const { error } = await supabase
      .from("verification_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );
  }

  function statusBadgeClass(status: string) {
    if (status === "verified") {
      return "bg-green-50 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Administration
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
            Verification Review Queue
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
            Review contributor verification requests, license documentation,
            and pending appraiser-only access submissions.
          </p>
        </section>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Verification Requests
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Contributor identity and license review records.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Requests
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {loading ? "—" : requests.length}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contributor
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    License #
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    License PDF
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Loading verification requests...
                    </td>
                  </tr>
                )}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No verification requests found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                        {request.full_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {request.email}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {request.license_number}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            viewLicense(request.license_file_path)
                          }
                          className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          View PDF
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
<button
  onClick={() => {
    alert("Approve clicked");
    updateStatus(request.id, "verified");
  }}
  className="rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
>
  Approve
</button>

                          <button
                            onClick={() =>
                              updateStatus(request.id, "rejected")
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}