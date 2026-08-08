"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "988b7d1f-4028-42a6-9a8f-be869224be6e";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  suspension_reason: string | null;
  suspended_at: string | null;
  created_at: string;
};

function statusLabel(status: string) {
  if (status === "published") return "E’lon qilingan";
  if (status === "draft") return "Qoralama";
  if (status === "archived") return "Arxiv";
  if (status === "suspended") return "To‘xtatilgan";
  return status;
}

function statusClass(status: string) {
  if (status === "published") return "bg-emerald-50 text-emerald-700";
  if (status === "draft") return "bg-amber-50 text-amber-700";
  if (status === "suspended") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdmin() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user || userData.user.id !== ADMIN_USER_ID) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, category, status, suspension_reason, suspended_at, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setArticles(data as Article[]);
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
        (article.category || "").toLowerCase().includes(query) ||
        (article.suspension_reason || "").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const publishedCount = articles.filter((article) => article.status === "published").length;
  const draftCount = articles.filter((article) => article.status === "draft").length;
  const suspendedCount = articles.filter((article) => article.status === "suspended").length;

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  async function verifyAdminSession() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user || data.user.id !== ADMIN_USER_ID) {
      alert("Admin sessiyasi tugagan. Iltimos, qayta kiring va amalni yana bajaring.");
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return false;
    }
    return true;
  }

  async function toggleSuspension(article: Article) {
    if (busyId) return;

    const restoring = article.status === "suspended";
    if (restoring && !confirm(`${article.title} maqolasi yana saytda e’lon qilinsinmi?`)) return;

    let reason: string | null = null;
    if (!restoring) {
      reason = prompt(
        "Maqolani to‘xtatish sababini yozing. Bu sabab faqat admin panelda ko‘rinadi.",
        "To‘lov amalga oshirilmagan"
      );
      if (reason === null) return;
    }

    setBusyId(article.id);
    try {
      if (!(await verifyAdminSession())) return;

      const suspendedAt = restoring ? null : new Date().toISOString();
      const nextReason = restoring ? null : reason!.trim() || "Sabab ko‘rsatilmagan";
      const nextStatus = restoring ? "published" : "suspended";

      const { data: updated, error } = await supabase
        .from("articles")
        .update({
          status: nextStatus,
          suspension_reason: nextReason,
          suspended_at: suspendedAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", article.id)
        .select("id, status, suspension_reason, suspended_at")
        .maybeSingle();

      if (error || !updated || updated.status !== nextStatus) {
        alert(
          `Amal bazaga saqlanmadi.${error?.message ? ` Xato: ${error.message}` : ""} Sahifani yangilang yoki admin hisobiga qayta kiring.`
        );
        return;
      }

      setArticles((current) =>
        current.map((item) =>
          item.id === article.id
            ? {
                ...item,
                status: updated.status,
                suspension_reason: updated.suspension_reason,
                suspended_at: updated.suspended_at,
              }
            : item
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] p-5 text-[#111827]">
        <p className="font-bold">Yuklanmoqda...</p>
      </main>
    );
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

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
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
            <div className="rounded-2xl bg-red-500/15 p-3 sm:p-4">
              <p className="text-[11px] font-bold text-red-100/70 sm:text-xs">To‘xtatilgan</p>
              <p className="mt-1 text-xl font-black sm:text-2xl">{suspendedCount}</p>
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
              ["suspended", "To‘xtatilgan"],
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
            <article key={article.id} className={`rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] ${article.status === "suspended" ? "border border-red-100" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-black leading-5">{article.title}</h2>
                  <p className="mt-1 truncate text-xs font-medium text-slate-400">/bunyodkorlar/{article.slug}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${statusClass(article.status)}`}>
                  {statusLabel(article.status)}
                </span>
              </div>

              {article.status === "suspended" && article.suspension_reason && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold leading-5 text-red-700">
                  Sabab: {article.suspension_reason}
                </div>
              )}

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
                {(article.status === "published" || article.status === "suspended") && (
                  <button
                    type="button"
                    disabled={busyId === article.id}
                    onClick={() => toggleSuspension(article)}
                    className={`col-span-2 min-h-11 rounded-xl px-3 py-2 text-sm font-extrabold disabled:opacity-50 ${
                      article.status === "suspended"
                        ? "bg-emerald-600 text-white"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {busyId === article.id
                      ? "Saqlanmoqda..."
                      : article.status === "suspended"
                      ? "Qayta e’lon qilish"
                      : "Maqolani to‘xtatish"}
                  </button>
                )}
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
                <tr key={article.id} className={`border-t border-slate-100 ${article.status === "suspended" ? "bg-red-50/30" : ""}`}>
                  <td className="p-4">
                    <p className="font-extrabold">{article.title}</p>
                    <p className="mt-1 text-xs text-slate-400">/bunyodkorlar/{article.slug}</p>
                    {article.status === "suspended" && article.suspension_reason && (
                      <p className="mt-2 max-w-md text-xs font-semibold text-red-600">Sabab: {article.suspension_reason}</p>
                    )}
                  </td>
                  <td className="p-4 text-sm">{article.category || "—"}</td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${statusClass(article.status)}`}>{statusLabel(article.status)}</span></td>
                  <td className="p-4 text-sm text-slate-500">{new Date(article.created_at).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-3 text-sm font-extrabold">
                      <Link href={`/bunyodkorlar/${article.slug}`} className="text-slate-500">Ochish</Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="text-[#0043a4]">Tahrirlash</Link>
                      {(article.status === "published" || article.status === "suspended") && (
                        <button
                          type="button"
                          disabled={busyId === article.id}
                          onClick={() => toggleSuspension(article)}
                          className={article.status === "suspended" ? "text-emerald-700 disabled:opacity-50" : "text-red-600 disabled:opacity-50"}
                        >
                          {busyId === article.id
                            ? "Saqlanmoqda..."
                            : article.status === "suspended"
                            ? "Qayta e’lon"
                            : "To‘xtatish"}
                        </button>
                      )}
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
