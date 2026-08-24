import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type Period = "week" | "month" | "year";

type RankingRow = {
  id: string;
  period_type: string;
  period_key: string;
  achievement_score: number;
  activity_score: number;
  leadership_score: number;
  evidence_score: number;
  total_score: number;
  ai_summary: string | null;
  scoring_source: "ai" | "rules" | "manual";
  computed_at: string;
  article: {
    id: string;
    title: string;
    slug: string;
    category: string | null;
    image_url: string | null;
    description: string | null;
  } | null;
};

function orderColumn(value: string | undefined) {
  if (value === "achievements") return "achievement_score";
  if (value === "activity") return "activity_score";
  if (value === "initiative" || value === "leadership") return "leadership_score";
  return "total_score";
}

function validPeriod(value: string | undefined): Period {
  if (value === "week" || value === "year") return value;
  return "month";
}

function isoWeekKey(date: Date) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function currentPeriodKey(period: Period) {
  const now = new Date();
  if (period === "week") return isoWeekKey(now);
  if (period === "month") return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return String(now.getUTCFullYear());
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("uz-UZ")
    .replace(/[ʻʼ’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function rankingHref(period: Period, sort: string, q?: string) {
  const params = new URLSearchParams({ period, sort });
  if (q?.trim()) params.set("q", q.trim());
  return `/reyting?${params.toString()}`;
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; period?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort || "overall";
  const period = validPeriod(params.period);
  const periodKey = currentPeriodKey(period);
  const column = orderColumn(sort);
  const q = (params.q || "").trim().slice(0, 120);

  // New periods are created lazily from the current approved all-time standings.
  // This RPC is idempotent and only inserts missing current-period baselines.
  await supabase.rpc("ensure_current_ranking_periods");

  const select = "id, period_type, period_key, achievement_score, activity_score, leadership_score, evidence_score, total_score, ai_summary, scoring_source, computed_at, article:articles(id, title, slug, category, image_url, description)";

  let { data } = await supabase
    .from("article_rankings")
    .select(select)
    .eq("status", "approved")
    .eq("period_type", period)
    .eq("period_key", periodKey)
    .order(column, { ascending: false })
    .order("total_score", { ascending: false })
    .limit(1000);

  // Safe fallback while the periodic migration is being rolled out.
  if (!data?.length) {
    const fallback = await supabase
      .from("article_rankings")
      .select(select)
      .eq("status", "approved")
      .eq("period_type", "all_time")
      .eq("period_key", "all")
      .order(column, { ascending: false })
      .order("total_score", { ascending: false })
      .limit(1000);
    data = fallback.data;
  }

  const rows = ((data || []) as unknown as RankingRow[]).filter((item) => item.article);
  const topThree = rows.slice(0, 3);
  const listRows = rows.slice(3, 100);

  const query = normalizeSearch(q);
  const queryTokens = query.split(" ").filter(Boolean);
  const searchMatches = query
    ? rows
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => {
          const title = normalizeSearch(row.article?.title || "");
          return queryTokens.every((token) => title.includes(token));
        })
        .slice(0, 5)
    : [];

  const sorts = [
    ["overall", "Umumiy reyting"],
    ["achievements", "Yutuqlar"],
    ["activity", "Faollik"],
    ["initiative", "Tashabbuskorlik"],
  ] as const;

  const periods: Array<[Period, string, string]> = [
    ["week", "Haftalik", "7 kunlik o‘sish"],
    ["month", "Oylik", "Joriy oy"],
    ["year", "Yillik", "Joriy yil"],
  ];

  const periodName = periods.find(([value]) => value === period)?.[1] || "Oylik";
  const sortName = sorts.find(([value]) => value === sort)?.[1] || "Umumiy reyting";

  return (
    <main className="min-h-screen bg-[#eef8fc] text-[#10253a]">
      <SiteMenu />
      <section className="px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32 xl:pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0d9fca]">Ochiq metodologiya</p>
            <h1 className="mt-3 text-[42px] font-black leading-none tracking-[-0.05em] text-[#09263e] sm:text-[56px]">Bunyodkorlar reytingi</h1>
            <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-600 md:text-lg">
              Haftalik, oylik va yillik reytinglar ensiklopediyada hujjatlashtirilgan yutuqlar, faollik, tashabbuskorlik va tasdiqlovchi dalillar asosida hisoblanadi.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {periods.map(([value, label, helper]) => (
              <Link
                key={value}
                href={rankingHref(value, sort, q)}
                className={`group rounded-[22px] border px-5 py-4 transition ${
                  period === value
                    ? "border-[#0aa9d8] bg-[#08263f] text-white shadow-[0_16px_38px_rgba(8,38,63,.18)]"
                    : "border-[#c3e5ef] bg-white text-[#10253a] hover:-translate-y-0.5 hover:border-[#8bd4e7]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${period === value ? "text-[#76ddff]" : "text-[#0d9fca]"}`}>{helper}</p>
                    <p className="mt-1 text-xl font-black">{label}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black ${period === value ? "bg-white/10" : "bg-[#e8f8fd] text-[#08a0ca]"}`}>→</span>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-6 rounded-[28px] border border-[#bfe2ed] bg-white p-4 shadow-[0_18px_50px_rgba(28,111,140,.08)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0d9fca]">Mening reytingim</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Ism-familiya orqali o‘rningizni toping</h2>
              </div>
              <div className="rounded-full bg-[#eef9fd] px-4 py-2 text-xs font-extrabold text-[#087fa8]">{periodName} • {sortName}</div>
            </div>

            <form action="/reyting" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="period" value={period} />
              <input type="hidden" name="sort" value={sort} />
              <label className="relative flex-1">
                <span className="sr-only">Ism va familiya</span>
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#0aa9d8]">⌕</span>
                <input
                  id="ranking-search"
                  name="q"
                  defaultValue={q}
                  placeholder="Ism va familiyangizni kiriting..."
                  autoComplete="off"
                  className="h-14 w-full rounded-2xl border border-[#bfe2ed] bg-[#fbfeff] pl-12 pr-4 text-[15px] font-bold text-[#10253a] outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-[#0aa9d8] focus:ring-4 focus:ring-[#0aa9d8]/10"
                />
              </label>
              <button type="submit" className="h-14 rounded-2xl bg-gradient-to-r from-[#087fb4] to-[#0aa9d8] px-7 text-sm font-black text-white shadow-[0_12px_28px_rgba(10,169,216,.2)] transition hover:-translate-y-0.5">
                Reytingni topish
              </button>
            </form>

            {q && (
              <div className="mt-5">
                {searchMatches.length ? (
                  <div className="grid gap-3">
                    {searchMatches.map(({ row, index }) => {
                      const article = row.article!;
                      const score = Number((row as unknown as Record<string, number>)[column] || 0);
                      return (
                        <div key={row.id} className="flex flex-col gap-4 rounded-[22px] border border-[#c9e9f2] bg-[#f8fdff] p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-[#d7edf4]">
                              {article.image_url ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] font-black text-slate-300">O‘zBYE</div>}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-lg font-black">{article.title}</p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#0c9ac2]">{article.category || "Bunyodkor"}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-5 sm:justify-end">
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{periodName} o‘rni</p>
                              <p className="text-2xl font-black text-[#08263f]">#{index + 1}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">Ball</p>
                              <p className="text-2xl font-black text-[#0a97c1]">{score.toFixed(1)}</p>
                            </div>
                            <Link href={`/bunyodkorlar/${article.slug}`} className="rounded-xl border border-[#bfe2ed] bg-white px-4 py-3 text-xs font-black text-[#087fa8] hover:bg-[#eef9fd]">Profil →</Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-900">
                    “{q}” bo‘yicha reytingdagi profil topilmadi. Ism yoki familiyani qisqaroq yozib qayta urinib ko‘ring.
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-[#c3e5ef] bg-white p-2">
            {sorts.map(([value, label]) => (
              <Link
                key={value}
                href={rankingHref(period, value, q)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${sort === value || (sort === "leadership" && value === "initiative") ? "bg-[#0aa9d8] text-white" : "text-slate-500 hover:bg-[#eef9fd]"}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {topThree.length > 0 && (
            <section className="mt-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0d9fca]">TOP 3</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">{periodName} yetakchilar</h2>
                </div>
                <p className="text-sm font-bold text-slate-400">{periodKey}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {topThree.map((row, index) => {
                  const article = row.article!;
                  const selectedScore = Number((row as unknown as Record<string, number>)[column] || 0);
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <article key={row.id} className={`relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_55px_rgba(28,111,140,.10)] ${index === 0 ? "border-[#0aa9d8] bg-[#08263f] text-white" : "border-[#bfe2ed] bg-white"}`}>
                      <div className="absolute right-4 top-3 text-4xl" aria-hidden="true">{medals[index]}</div>
                      <div className="flex items-center gap-4 pr-12">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] bg-slate-100 ring-1 ring-white/20">
                          {article.image_url ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black text-slate-300">O‘zBYE</div>}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${index === 0 ? "text-[#76ddff]" : "text-[#0d9fca]"}`}>#{index + 1} o‘rin</p>
                          <Link href={`/bunyodkorlar/${article.slug}`} className={`mt-1 block text-lg font-black leading-tight ${index === 0 ? "text-white" : "text-[#10253a] hover:text-[#007da8]"}`}>{article.title}</Link>
                          <p className={`mt-1 text-xs font-bold ${index === 0 ? "text-white/55" : "text-slate-400"}`}>{article.category || "Bunyodkor"}</p>
                        </div>
                      </div>
                      <div className={`mt-5 flex items-end justify-between border-t pt-4 ${index === 0 ? "border-white/10" : "border-slate-100"}`}>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.13em] ${index === 0 ? "text-white/45" : "text-slate-400"}`}>{sortName}</p>
                          <p className={`mt-1 text-4xl font-black tracking-[-0.05em] ${index === 0 ? "text-[#76ddff]" : "text-[#08263f]"}`}>{selectedScore.toFixed(1)}</p>
                        </div>
                        <Link href={`/bunyodkorlar/${article.slug}`} className={`rounded-xl px-4 py-2.5 text-xs font-black ${index === 0 ? "bg-white/10 text-white hover:bg-white/15" : "bg-[#eef9fd] text-[#087fa8] hover:bg-[#e1f4fa]"}`}>Profil →</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          <section className="mt-6 overflow-hidden rounded-[28px] border border-[#bfe2ed] bg-white shadow-[0_20px_55px_rgba(28,111,140,.08)]">
            <div className="flex flex-col gap-2 border-b border-[#e1f0f5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0d9fca]">{periodName} reyting</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">{rows.length ? `${rows.length} ta profil reytingda` : "Reyting hisoblanmoqda"}</h2>
              </div>
              <Link href="/sanjar-ai" className="text-sm font-extrabold text-[#087fa8]">Bunyodkor AI’dan so‘rash →</Link>
            </div>

            {rows.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {listRows.map((row, offset) => {
                  const index = offset + 3;
                  const article = row.article!;
                  const selectedScore = Number((row as unknown as Record<string, number>)[column] || 0);
                  return (
                    <article key={row.id} className="grid gap-4 px-5 py-5 transition hover:bg-[#f9fdff] sm:grid-cols-[56px_72px_1fr_auto] sm:items-center sm:px-7">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f8fd] text-lg font-black text-[#078eb7]">{index + 1}</div>
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                        {article.image_url ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black text-slate-300">O‘zBYE</div>}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/bunyodkorlar/${article.slug}`} className="text-lg font-black tracking-[-0.02em] text-[#10253a] hover:text-[#007da8]">{article.title}</Link>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#0c9ac2]">{article.category || "Bunyodkor"}</p>
                        <div className="mt-3 grid max-w-2xl grid-cols-2 gap-2 text-[10px] font-extrabold text-slate-400 sm:grid-cols-4">
                          <span>Yutuq {Number(row.achievement_score).toFixed(1)}</span>
                          <span>Faollik {Number(row.activity_score).toFixed(1)}</span>
                          <span>Tashabbus {Number(row.leadership_score).toFixed(1)}</span>
                          <span>Dalil {Number(row.evidence_score).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-3xl font-black tracking-[-0.05em] text-[#08263f]">{selectedScore.toFixed(1)}</p>
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">ball</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f8fd] text-xl font-black text-[#08a0ca]">R</div>
                <h3 className="mt-4 text-xl font-black">Reyting ma’lumotlari tayyorlanmoqda</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-500">Davriy reyting ma’lumotlari avtomatik tayyorlanadi.</p>
              </div>
            )}
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["60", "Yutuqlar", "Mukofotlar, tanlov natijalari, xalqaro va milliy e’tiroflar, nashrlar hamda aniq natijalar."],
              ["20", "Faollik", "Loyiha, nashr, tanlov, volontyorlik va muntazam amaliy ishtirok."],
              ["15", "Tashabbuskorlik", "Asoschilik, koordinatorlik, tashkilotchilik, mentorlik va jamoaviy tashabbuslar."],
              ["5", "Dalillar", "Tasdiqlovchi hujjat va manba mavjudligi. Shunchaki da’vo uchun ball berilmaydi."],
            ].map(([score, title, text]) => (
              <div key={title} className="rounded-[22px] border border-[#c5e5ee] bg-white p-5">
                <p className="text-3xl font-black text-[#0a97c1]">{score}</p>
                <h3 className="mt-2 text-lg font-black">{title}</h3>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </section>

          <div className="mt-6 rounded-[22px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-900">
            Davriy reyting shu davr ichidagi reyting ballari o‘sishini ko‘rsatadi. Tizim ishga tushgan joriy davr uchun mavjud boshlang‘ich ballar ham hisobga olingan. Reyting insonning umumiy qadrini baholamaydi va shaxsiy yoki sensitiv belgilar ballga ta’sir qilmaydi.
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
