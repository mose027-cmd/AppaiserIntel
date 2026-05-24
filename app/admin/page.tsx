"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  license_number: string | null;
  state: string | null;
  verification_status: string | null;
  created_at: string | null;
};

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setProfiles(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ verification_status: status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadProfiles();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">
          Admin Verification Dashboard
        </h1>

        <p className="mb-8 text-slate-600">
          Review pending appraiser verification submissions.
        </p>

        {loading && <p>Loading verification requests...</p>}

        {!loading && profiles.length === 0 && (
          <p className="text-slate-600">No verification submissions found.</p>
        )}

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {profile.full_name || "Unnamed appraiser"}
                  </p>
                  <p className="text-slate-600">{profile.email}</p>
                  <p className="text-slate-600">
                    License: {profile.license_number || "Not provided"}
                  </p>
                  <p className="text-slate-600">
                    State: {profile.state || "Not provided"}
                  </p>
                  <p className="mt-2 font-semibold">
                    Status: {profile.verification_status || "pending"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(profile.id, "approved")}
                    className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(profile.id, "rejected")}
                    className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
