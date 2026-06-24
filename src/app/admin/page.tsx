"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        (article.category || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const publishedCount = articles.filter(
    (article) => article.status === "published"
  ).length;

  const draftCount = articles.filter((article) => article.status === "draft")
    .length;

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
        <div className="mb-8 rounded-3xl bg-[#0f3d2e] p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Hammasi</p>
              <p className="text-2xl font-bold">{articles.length}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Published</p>
              <p className="text-2xl font-bold">{publishedCount}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-emerald-100">Draft</p>
              <p className="text-2xl font-bold">{draftCount}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl bg-white p-5 shadow-md md:grid-cols-[1fr_220px]">
          <input
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, familiya, kategoriya yoki slug bo‘yicha qidirish..."
          />

          <select
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Barcha statuslar</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Topildi: <b>{filteredArticles.length}</b> ta maqola
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Maqola</th>
                <th className="p-4">Kategoriya</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sana</th>
                <th className="p-4">Saytda ko‘rish</th>
                <th className="p-4">Tahrirlash</th>
              </tr>
            </thead>

            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-t">
                  <td className="p-4">
                    <p className="font-semibold">{article.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      /bunyodkorlar/{article.slug}
                    </p>
                  </td>

                  <td className="p-4">{article.category || "-"}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        article.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {new Date(article.created_at).toLocaleDateString("uz-UZ")}
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

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Bunday maqola topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}