"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MobileArticleEditor from "@/components/admin/MobileArticleEditor";
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

  if (error) return <main className="min-h-screen bg-[#eef3fb] p-4 md:p-8"><p className="rounded-xl bg-white p-5 text-red-600 shadow">{error}</p></main>;
  if (!article) return <main className="min-h-screen bg-[#eef3fb] p-4 md:p-8"><p>Yuklanmoqda...</p></main>;

  if ((article.status as string) === "suspended") {
    const reason = (article as ArticleRecord & { suspension_reason?: string | null }).suspension_reason;
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-[#111827]">
        <div className="mx-auto max-w-xl rounded-[28px] border border-red-100 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,.08)] sm:p-8">
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-red-700">To‘xtatilgan</span>
          <h1 className="mt-4 text-2xl font-black tracking-[-.03em]">{article.title}</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Ushbu maqola hozir public saytda 404 holatida. Tasodifan statusini o‘zgartirib yubormaslik uchun tahrirlash vaqtincha yopilgan.
          </p>
          {reason && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">Ichki sabab: {reason}</div>
          )}
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
            Tahrirlash kerak bo‘lsa, Admin panelga qaytib avval “Qayta e’lon qilish”ni bosing.
          </p>
          <Link href="/admin" className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-[#0043a4] px-5 py-3 text-sm font-extrabold text-white">
            ← Admin panelga qaytish
          </Link>
        </div>
      </main>
    );
  }

  return <MobileArticleEditor initial={{
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
