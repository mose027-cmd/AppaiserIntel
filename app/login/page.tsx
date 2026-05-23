"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (mode === "signup") {
      alert("Account created successfully. You can now sign in.");
      setMode("signin");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          AppraiserIntel Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <button
            type="submit"
            disabled={loading}
            onClick={() => setMode("signin")}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            {loading && mode === "signin" ? "Working..." : "Sign In"}
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={() => setMode("signup")}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold"
          >
            {loading && mode === "signup" ? "Working..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
