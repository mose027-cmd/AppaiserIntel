"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getLoginValues() {
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;

  return {
    email: emailInput?.value.trim() || "",
    password: passwordInput?.value.trim() || "",
  };
}

export default function LoginPage() {
 async function signUp() {
  const email = prompt("Enter email") || "";
  const password = prompt("Enter password") || "";

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim(),
  });

  if (error) alert(error.message);
  else alert("Account created successfully.");
}

async function signIn() {
  const email = prompt("Enter email") || "";
  const password = prompt("Enter password") || "";

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });

  if (error) alert(error.message);
  else window.location.href = "/";
}
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          AppraiserIntel Login
        </h1>

        <div className="space-y-4">
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <button
            type="button"
            onClick={signIn}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={signUp}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    </main>
  );
}
