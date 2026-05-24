"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setMessage("");

    try {
const response = await fetch(

  "https://lyibzziciksphcgrjdgm.supabase.co/auth/v1/token?grant_type=password",
{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
apikey: "sb_publishable_FvMSUZwZcDAin4783xDsWA_NtOydzlr",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error_description || result.msg || "Login failed");
        return;
      }

      await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
localStorage.setItem(
  "sb-lyibzziciksphcgrjdgm-auth-token",
  JSON.stringify(result)
);
setTimeout(() => {
  window.location.href = "/dashboard";
}, 500);
    } catch (err) {
      console.error(err);
      setMessage("Login failed.");
    } finally {
      setLoading(false);
    }
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            {loading ? "Working..." : "Sign In"}
          </button>

          {message && (
            <div className="rounded-xl bg-slate-100 p-4 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}