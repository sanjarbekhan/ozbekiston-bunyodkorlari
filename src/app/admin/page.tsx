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

function statusLabel(status: string) {
  if (status === "published") return "E’lon qilingan";
  if (status === "draft") return "Qoralama";
  if (status === "archived") return "Arxiv";
  return status;
}

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

      if (!error && data) setArticles(data);
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
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const publishedCount = articles.filter((article) => article.status === "published").length;
  const draftCount = articles.filter((article) => article.status === "draft").length;

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f4f7fb] p-5 text-[#111827]"><p className="font-bold">Yuklanmoqda...</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-10 text-[#111827]">
      <section className="mx-auto max-w-6xl px-3 py-4 sm:px-5 md:py-8">
        <header className="rounded-[28px] bg-[#071426] p-5 text-white shadow-xl sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">O‘zBYE boshqaruv</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">Admin panel</h1>
              <p className="mt-2 text-sm font-medium text-white/60">Maqolalarni telefon yoki kompyuterdan boshqaring.</p>
            </div>
            <button onClick={logout} className="rounded-full bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-white/20">Chiqish</button>
          </div>

          <Link href="/admin/articles/new" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#0f68ff] px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-950/20 sm:w-auto sm:min-w-52">
            + Yangi maqola
          </Link>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white/8 p-3 sm:p-4">
              <p className="text-[11px] font-bold text-white/50 sm:text-xs">Jami</p>
              <p className="mt-1 text-xl font-black sm:text-2xl">{articles.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3 sm:p-4">
              <p className="text-[11px] font-bold text-white/50 sm:text-xs">E’lon</p>
              <p className="mt-1 text-xl font-black sm:text-2xl">{publishedCount}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3 sm:p-4">
              <p className="text-[11px] font-bold text-white/50 sm:text-xs">Qoralama</p>
              <p className="mt-1 text-xl font-black sm:text-2xl">{draftCount}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 rounded-[24px] bg-white p-3 shadow-[0_8px_26px_rgba(15,23,42,.05)] sm:p-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 text-base outline-none transition focus:border-[#0043a4] focus:bg-white"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Maqolani qidirish..."
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              ["all", "Hammasi"],
              ["published", "E’lon qilingan"],
              ["draft", "Qoralama"],
              ["archived", "Arxiv"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold ${
                  statusFilter === value ? "bg-[#0043a4] text-white" : "bg-[#eef3fb] text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1 text-sm text-slate-500">
          <span><b className="text-[#111827]">{filteredArticles.length}</b> ta maqola</span>
        </div>

        <div className="mt-3 space-y-3 md:hidden">
          {filteredArticles.map((article) => (
            <article key={article.id} className="rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-black leading-5">{article.title}</h2>
                  <p className="mt-1 truncate text-xs font-medium text-slate-400">/bunyodkorlar/{article.slug}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                  article.status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : article.status === "draft"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {statusLabel(article.status)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                {article.category && <span className="rounded-full bg-[#eef3fb] px-3 py-1.5">{article.category}</span>}
                <span>{new Date(article.created_at).toLocaleDateString("uz-UZ")}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/bunyodkorlar/${article.slug}`} className="flex min-h-11 items-center justify-center rounded-xl bg-[#f4f7fb] px-3 py-2 text-sm font-extrabold text-slate-600">
                  Saytda ko‘rish
                </Link>
                <Link href={`/admin/articles/${article.id}/edit`} className="flex min-h-11 items-center justify-center rounded-xl bg-[#0043a4] px-3 py-2 text-sm font-extrabold text-white">
                  Tahrirlash
                </Link>
              </div>
            </article>
          ))}

          {filteredArticles.length === 0 && (
            <div className="rounded-[22px] bg-white p-8 text-center text-sm font-semibold text-slate-500">Bunday maqola topilmadi.</div>
          )}
        </div>

        <div className="mt-3 hidden overflow-hidden rounded-[24px] bg-white shadow-[0_8px_26px_rgba(15,23,42,.05)] md:block">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f8fafc] text-sm">
              <tr>
                <th className="p-4">Maqola</th>
                <th className="p-4">Kategoriya</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sana</th>
                <th className="p-4">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-t border-slate-100">
                  <td className="p-4">
                    <p className="font-extrabold">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-400">/bunyodkorlar/{article.slug}</p>
                  </td>
                  <td className="p-4 text-sm">{article.category || "—"}</td>
                  <td className="p-4"><span className="rounded-full bg-[#eef3fb] px-3 py-1.5 text-xs font-extrabold">{statusLabel(article.status)}</span></td>
                  <td className="p-4 text-sm text-slate-500">{new Date(article.created_at).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-4">
                    <div className="flex gap-3 text-sm font-extrabold">
                      <Link href={`/bunyodkorlar/${article.slug}`} className="text-slate-500">Ochish</Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="text-[#0043a4]">Tahrirlash</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredArticles.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Bunday maqola topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
