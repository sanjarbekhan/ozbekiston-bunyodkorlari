import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";
import RankingClient, { type Period, type RankingRow, type SortMode } from "./RankingClient";

export const revalidate = 60;

function isoWeekKey(date: Date) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function currentPeriodKeys(): Record<Period, string> {
  const now = new Date();
  return {
    week: isoWeekKey(now),
    month: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
    year: String(now.getUTCFullYear()),
  };
}

function validPeriod(value: string | undefined): Period {
  if (value === "week" || value === "year") return value;
  return "month";
}

function validSort(value: string | undefined): SortMode {
  if (value === "achievements" || value === "activity" || value === "initiative") return value;
  return "overall";
}

const rankingSelect = "id, period_type, period_key, achievement_score, activity_score, leadership_score, evidence_score, total_score, article:articles(id, title, slug, category, image_url)";

async function fetchPeriodicRows(periodKeys: Record<Period, string>) {
  const load = () =>
    supabase
      .from("article_rankings")
      .select(rankingSelect)
      .eq("status", "approved")
      .in("period_type", ["week", "month", "year"])
      .in("period_key", [periodKeys.week, periodKeys.month, periodKeys.year])
      .limit(3000);

  let response = await load();
  let rows = ((response.data || []) as unknown as RankingRow[]).filter((item) => item.article);

  const hasEveryPeriod = (["week", "month", "year"] as Period[]).every((period) =>
    rows.some((row) => row.period_type === period && row.period_key === periodKeys[period]),
  );

  // Normally this does not run. It is only a rollover safety net when a new
  // week/month/year starts and the first periodic snapshot has not been made yet.
  if (!hasEveryPeriod) {
    await supabase.rpc("ensure_current_ranking_periods");
    response = await load();
    rows = ((response.data || []) as unknown as RankingRow[]).filter((item) => item.article);
  }

  return rows;
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; period?: string; q?: string }>;
}) {
  const params = await searchParams;
  const periodKeys = currentPeriodKeys();
  const rows = await fetchPeriodicRows(periodKeys);

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

          <RankingClient
            rows={rows}
            periodKeys={periodKeys}
            initialPeriod={validPeriod(params.period)}
            initialSort={validSort(params.sort)}
            initialQuery={(params.q || "").trim().slice(0, 120)}
          />

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
