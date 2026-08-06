"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { supabase } from "@/lib/supabase";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("articles").select("*").eq("id", params.id).single()
      .then(({ data, error }) => {
        if (error || !data) setError("Maqola topilmadi yoki kirish huquqi yo‘q.");
        else setArticle(data);
      });
  }, [params.id]);

  if (error) return <main className="min-h-screen bg-[#eef3fb] p-8"><p className="rounded-xl bg-white p-5 text-red-600 shadow">{error}</p></main>;
  if (!article) return <main className="min-h-screen bg-[#eef3fb] p-8"><p>Yuklanmoqda...</p></main>;

  return <ArticleEditor initial={article} />;
}
