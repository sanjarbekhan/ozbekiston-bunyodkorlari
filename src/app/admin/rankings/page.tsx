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
};

type Achievement = {
  text: string;
  level: string;
  kind: string;
  year?: number | null;
};

type Ranking = {
  id: string;
  article_id: string;
  achievement_score: number;
  activity_score: number;
  leadership_score: number;
  evidence_score: number;
  total_score: number;
  achievements: Achievement[];
  ai_summary: string | null;
  ai_confidence: number | null;
  scoring_source: "ai" | "rules" | "manual";
  status: "pending" | "approved" | "rejected";
  computed_at: string;
};

export default function RankingsAdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "none" | "pending" | "approved" | "rejected">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || userData.user.id !== ADMIN_USER_ID) {
        router.replace("/admin/login");
        return;
      }
      const [articlesResult, rankingsResult] = await Promise.all([
        supabase.from("articles").select("id, title, slug, category").eq("status", "published").order("published_at", { ascending: false }).limit(500),
        supabase.from("article_rankings").select("id, article_id, achievement_score, activity_score, leadership_score, evidence_score, total_score, achievements, ai_summary, ai_confidence, scoring_source, status, computed_at").eq("period_type", "all_time").eq("period_key", "all").order("computed_at", { ascending: false }).limit(500),
      ]);
      if (articlesResult.data) setArticles(articlesResult.data as Article[]);
      if (rankingsResult.data) setRankings(rankingsResult.data as unknown as Ranking[]);
      if (articlesResult.error || rankingsResult.error) setMessage(articlesResult.error?.message || rankingsResult.error?.message || "Ma’lumotlarni yuklab bo‘lmadi.");
      setLoading(false);
    }
    void load();
  }, [router]);

  const rankingByArticle = useMemo(() => new Map(rankings.map((item) => [item.article_id, item])), [rankings]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return articles.filter((article) => {
      const ranking = rankingByArticle.get(article.id);
      const matchesSearch = !query || `${article.title} ${article.slug} ${article.category || ""}`.toLocaleLowerCase("uz").includes(query);
      const matchesFilter = filter === "all" || (filter === "none" ? !ranking : ranking?.status === filter);
      return matchesSearch && matchesFilter;
    });
  }, [articles, rankingByArticle, search, filter]);

  async function analyze(article: Article) {
    if (busyId) return;
    setBusyId(article.id);
    setMessage("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      const response = await fetch("/api/admin/rankings/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ articleId: article.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ranking) {
        setMessage(data.error || "Reytingni hisoblab bo‘lmadi.");
        return;
      }
      setRankings((current) => [data.ranking as Ranking, ...current.filter((item) => item.article_id !== article.id)]);
      setFilter("pending");
    } catch {
      setMessage("Reyting tahlilida xatolik yuz berdi.");
    } finally {
      setBusyId(null);
    }
  }

  async function setStatus(ranking: Ranking, status: "approved" | "rejected") {
    if (busyId) return;
    setBusyId(ranking.article_id);
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || userData.user.id !== ADMIN_USER_ID) {
      router.replace("/admin/login");
      return;
    }
    const { data, error } = await supabase
      .from("article_rankings")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        approved_by: status === "approved" ? userData.user.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ranking.id)
      .select("id, article_id, achievement_score, activity_score, leadership_score, evidence_score, total_score, achievements, ai_summary, ai_confidence, scoring_source, status, computed_at")
      .single();
    if (error || !data) setMessage(error?.message || "Statusni saqlab bo‘lmadi.");
    else setRankings((current) => current.map((item) => item.id === ranking.id ? data as unknown as Ranking : item));
    setBusyId(null);
  }

  if (loading) return <main className="min-h-screen bg-[#f4f7fb] p-6 font-bold">Reytinglar yuklanmoqda…</main>;

  const pending = rankings.filter((item) => item.status === "pending").length;
  const approved = rankings.filter((item) => item.status === "approved").length;

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-16 text-[#111827]">
      <section className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <header className="rounded-[28px] bg-[#071426] p-5 text-white sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">O‘zBYE boshqaruv</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">AI reyting nazorati</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/60">AI maqoladan yutuqlarni ajratadi, ball esa ochiq formulaga ko‘ra hisoblanadi. Hech bir natija siz tasdiqlamaguningizcha ommaga chiqmaydi.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/reyting" target="_blank" className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-extrabold">Ommaviy reyting ↗</Link>
              <Link href="/admin" className="rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#071426]">← Admin panel</Link>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/8 p-4"><p className="text-xs font-bold text-white/50">Tahlil qilingan</p><p className="mt-1 text-2xl font-black">{rankings.length}</p></div>
            <div className="rounded-2xl bg-amber-400/12 p-4"><p className="text-xs font-bold text-amber-100/70">Tekshiruvda</p><p className="mt-1 text-2xl font-black">{pending}</p></div>
            <div className="rounded-2xl bg-emerald-400/12 p-4"><p className="text-xs font-bold text-emerald-100/70">Ommaviy</p><p className="mt-1 text-2xl font-black">{approved}</p></div>
          </div>
        </header>

        {message && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</div>}

        <div className="mt-4 rounded-[22px] bg-white p-3 shadow-sm">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Profilni qidirish…" className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-semibold outline-none focus:border-[#0043a4]" />
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {([
              ["pending", `Tekshiruvda ${pending}`], ["none", "Tahlil qilinmagan"], ["approved", `Tasdiqlangan ${approved}`], ["rejected", "Rad etilgan"], ["all", "Hammasi"],
            ] as const).map(([value, label]) => (
              <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold ${filter === value ? "bg-[#0043a4] text-white" : "bg-[#eef3fb] text-slate-600"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {filtered.map((article) => {
            const ranking = rankingByArticle.get(article.id);
            return (
              <article key={article.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_8px_26px_rgba(15,23,42,.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {ranking ? <span className={`rounded-full px-3 py-1 text-[11px] font-black ${ranking.status === "approved" ? "bg-emerald-50 text-emerald-700" : ranking.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{ranking.status === "approved" ? "Tasdiqlangan" : ranking.status === "rejected" ? "Rad etilgan" : "Tekshiruvda"}</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">Tahlil qilinmagan</span>}
                      {ranking && <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[11px] font-black text-[#0043a4]">{ranking.scoring_source === "ai" ? "AI ajratgan" : "Qoidaviy fallback"}</span>}
                    </div>
                    <h2 className="mt-3 text-xl font-black tracking-[-0.02em]">{article.title}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-400">{article.category || "Bunyodkor"}</p>
                    {ranking?.ai_summary && <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{ranking.ai_summary}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button disabled={busyId === article.id} onClick={() => void analyze(article)} className="rounded-xl bg-[#0043a4] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{busyId === article.id ? "Tahlil…" : ranking ? "Qayta tahlil" : "AI tahlil"}</button>
                    {ranking && ranking.status !== "approved" && <button disabled={busyId === article.id} onClick={() => void setStatus(ranking, "approved")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">Tasdiqlash</button>}
                    {ranking && ranking.status !== "rejected" && <button disabled={busyId === article.id} onClick={() => void setStatus(ranking, "rejected")} className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">Rad etish</button>}
                    <Link href={`/bunyodkorlar/${article.slug}`} target="_blank" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600">Profil ↗</Link>
                  </div>
                </div>

                {ranking && (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {[
                        ["Umumiy", ranking.total_score, 100], ["Yutuq", ranking.achievement_score, 60], ["Faollik", ranking.activity_score, 20], ["Liderlik", ranking.leadership_score, 15], ["Dalil", ranking.evidence_score, 5],
                      ].map(([label, value, max]) => (
                        <div key={String(label)} className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{Number(value).toFixed(1)}<span className="text-xs font-bold text-slate-300">/{max}</span></p></div>
                      ))}
                    </div>
                    {Array.isArray(ranking.achievements) && ranking.achievements.length > 0 && (
                      <details className="mt-4 rounded-xl border border-slate-200 bg-[#fbfcfe] p-4">
                        <summary className="cursor-pointer text-sm font-black text-[#0043a4]">Aniqlangan yutuqlar ({ranking.achievements.length})</summary>
                        <div className="mt-3 space-y-2">
                          {ranking.achievements.map((item, index) => <p key={index} className="text-xs font-semibold leading-5 text-slate-600"><b>{index + 1}.</b> {item.text} <span className="text-slate-400">({item.level}, {item.kind}{item.year ? `, ${item.year}` : ""})</span></p>)}
                        </div>
                      </details>
                    )}
                  </>
                )}
              </article>
            );
          })}

          {filtered.length === 0 && <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-bold text-slate-400">Bu filtr bo‘yicha profil topilmadi.</div>}
        </div>
      </section>
    </main>
  );
}
