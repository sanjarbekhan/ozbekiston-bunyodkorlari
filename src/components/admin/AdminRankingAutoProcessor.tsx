"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "988b7d1f-4028-42a6-9a8f-be869224be6e";
const BATCH_SIZE = 5;

type PendingRanking = {
  article_id: string;
};

export default function AdminRankingAutoProcessor() {
  const running = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function processPending() {
      if (running.current || cancelled) return;
      running.current = true;

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (cancelled || userData.user?.id !== ADMIN_USER_ID) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        for (let pass = 0; pass < 20 && !cancelled; pass += 1) {
          const { data, error } = await supabase
            .from("article_rankings")
            .select("article_id")
            .eq("period_type", "all_time")
            .eq("period_key", "all")
            .eq("status", "pending")
            .eq("scoring_version", "v3-bunyodkor-ai-pending")
            .order("updated_at", { ascending: true })
            .limit(BATCH_SIZE);

          if (error || !data?.length) break;

          for (const row of data as PendingRanking[]) {
            if (cancelled) break;
            const response = await fetch("/api/admin/rankings/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ articleId: row.article_id }),
            });

            if (!response.ok) {
              // Leave it pending. A later admin session can retry safely.
              return;
            }
          }
        }
      } finally {
        running.current = false;
      }
    }

    void processPending();
    const interval = window.setInterval(() => void processPending(), 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
