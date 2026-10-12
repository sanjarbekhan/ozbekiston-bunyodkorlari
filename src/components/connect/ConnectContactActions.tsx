"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConnectContactActions({ articleId }: { articleId: string }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.rpc("connect_contact_available", { p_article_id: articleId })
      .then(({ data, error }) => {
        if (active) setAvailable(!error && data === true);
      });
    return () => { active = false; };
  }, [articleId]);

  if (!available) return null;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link href={"/chat?article=" + articleId + "&kind=question"}
        className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#245fff] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(36,91,255,.18)] hover:bg-[#164bd8]">
        ✉ Savol berish
      </Link>
      <Link href={"/chat?article=" + articleId + "&kind=collaboration"}
        className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#b6d0fa] bg-white px-5 py-3 text-sm font-bold text-[#245fff] hover:bg-[#edf4ff]">
        Hamkorlik taklif qilish ↗
      </Link>
    </div>
  );
}
