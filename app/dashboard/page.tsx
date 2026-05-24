"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

setEmail(user.email || "");

const { data: profile } = await supabase
  .from("user_profiles")
  .select("verification_status")
  .eq("id", user.id)
  .single();

if (!profile) {
  window.location.href = "/verify";
  return;
}

if (profile.verification_status !== "approved") {
  alert("Your verification is still pending approval.");
  window.location.href = "/verify";
  return;
}
    }

    loadUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              AppraiserIntel Dashboard
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Signed in as: {email}
            </p>
          </div>

          <button
            onClick={signOut}
            className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}