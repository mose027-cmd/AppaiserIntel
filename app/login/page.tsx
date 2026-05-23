"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Account created successfully.");

    setLoading(false);
  }

  async function signIn() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else window.location.href = "/";

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          AppraiserIntel Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Sign In
          </button>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    </main>
  );
}
