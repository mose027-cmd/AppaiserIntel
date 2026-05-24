"use client";

import { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function getValues() {
    return {
      email: emailRef.current?.value.trim() || "",
      password: passwordRef.current?.value.trim() || "",
    };
  }

  async function signUp() {
    const { email, password } = getValues();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

if (password.length < 6) {
  setErrorMessage("Password must be at least 6 characters.");
  setMessage("");
  return;
}

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/login",
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

setMessage("Check your email to verify your account before logging in.");
setErrorMessage("");

  }

  async function signIn() {
    const { email, password } = getValues();

if (!email || !password) {
  setErrorMessage("Please enter both email and password.");
  setMessage("");
  return;
}

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

if (error) {
  setErrorMessage(error.message);
  setMessage("");
  return;
}

window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          AppraiserIntel Login
        </h1>

        <div className="space-y-4">
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <button
            type="button"
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            {loading ? "Working..." : "Sign In"}
          </button>

          <button
            type="button"
            onClick={signUp}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold"
          >
            {loading ? "Working..." : "Create Account"}
          </button>
        </div>
      </div>
    </main>
  );
}
