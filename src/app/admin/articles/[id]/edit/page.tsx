"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import type { ArticleRecord } from "@/lib/article-types";
import { supabase } from "@/lib/supabase";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("articles").select("*").eq("id", params.id).single()
      .then(({ data, error }) => {
        if (error || !data) setError("Maqola topilmadi yoki kirish huquqi yo‘q.");
        else setArticle(data as ArticleRecord);
      });
  }, [params.id]);

  if (error) return <main className="min-h-screen bg-[#eef3fb] p-8"><p className="rounded-xl bg-white p-5 text-red-600 shadow">{error}</p></main>;
  if (!article) return <main className="min-h-screen bg-[#eef3fb] p-8"><p>Yuklanmoqda...</p></main>;

  return <ArticleEditor initial={{
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category || "",
    image_url: article.image_url || "",
    description: article.description || "",
    content: article.content || "",
    content_blocks: article.content_blocks || [],
    video_url: article.video_url || "",
    status: article.status,
    author_name: article.author_name || "",
    author_url: article.author_url || "",
    seo_title: article.seo_title || "",
    seo_description: article.seo_description || "",
    seo_keywords: article.seo_keywords || "",
    social_title: article.social_title || "",
    social_description: article.social_description || "",
    social_image_url: article.social_image_url || "",
  }} />;
}
