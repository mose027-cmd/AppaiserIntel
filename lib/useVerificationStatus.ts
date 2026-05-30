"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "not_submitted";

export function useVerificationStatus() {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [status, setStatus] =
    useState<VerificationStatus>("not_submitted");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("not_submitted");
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("verification_requests")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setStatus((data?.status as VerificationStatus) || "not_submitted");
      setLoading(false);
    }

    loadStatus();
  }, [supabase]);

  return {
    status,
    loading,
    isVerified: status === "verified",
  };
}