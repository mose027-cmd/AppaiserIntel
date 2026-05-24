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
};

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  checkAdmin();
}, []);

async function checkAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  window.location.href = "/login";
  return;
}

  if (user.email !== "rmosely@dmappraisal.com") {
    alert("Unauthorized");
    window.location.href = "/dashboard";
    return;
  }

await loadProfiles();
setLoading(false);
}

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setProfiles(data || []);
  }

  async function approveUser(id: string) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ verification_status: "approved" })
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
        <h1 className="mb-6 text-4xl font-bold text-slate-900">
          Admin Verification Dashboard
        </h1>

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{profile.full_name}</p>
                  <p>{profile.email}</p>
                  <p>License: {profile.license_number}</p>
                  <p>State: {profile.state}</p>
                  <p>Status: {profile.verification_status}</p>
                </div>

                {profile.verification_status !== "approved" && (
                  <button
                    onClick={() => approveUser(profile.id)}
                    className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}