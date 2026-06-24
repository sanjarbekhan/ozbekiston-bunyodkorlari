"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, category, status, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setArticles(data);
      }

      setLoading(false);
    }

    loadAdmin();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] p-8">
        <p>Yuklanmoqda...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] p-6 text-[#14231b]">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#0f3d2e] p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold">Admin panel</h1>
            <p className="mt-1 text-emerald-100">
              Jami maqolalar: {articles.length} ta
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/articles/new"
              className="rounded-xl bg-emerald-100 px-4 py-2 font-semibold text-[#0f3d2e]"
            >
              + Yangi maqola
            </Link>

            <button
              onClick={logout}
              className="rounded-xl bg-white px-4 py-2 font-semibold text-[#0f3d2e]"
            >
              Chiqish
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Maqola</th>
                <th className="p-4">Kategoriya</th>
                <th className="p-4">Status</th>
                <th className="p-4">Saytda ko‘rish</th>
                <th className="p-4">Tahrirlash</th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-t">
                  <td className="p-4 font-semibold">{article.title}</td>
                  <td className="p-4">{article.category || "-"}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/bunyodkorlar/${article.slug}`}
                      className="font-semibold text-emerald-700"
                    >
                      Ochish
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="font-semibold text-blue-700"
                    >
                      Tahrirlash
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}