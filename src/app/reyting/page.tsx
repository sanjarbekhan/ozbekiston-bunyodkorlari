import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type RankingRow = {
  id: string;
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

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort || "overall";
  const column = orderColumn(sort);

  const { data } = await supabase
    .from("article_rankings")
    .select("id, achievement_score, activity_score, leadership_score, evidence_score, total_score, ai_summary, scoring_source, computed_at, article:articles(id, title, slug, category, image_url, description)")
    .eq("status", "approved")
    .eq("period_type", "all_time")
    .eq("period_key", "all")
    .order(column, { ascending: false })
    .order("total_score", { ascending: false })
    .limit(100);

  const rows = ((data || []) as unknown as RankingRow[]).filter((item) => item.article);

  const sorts = [
    ["overall", "Umumiy reyting"],
    ["achievements", "Yutuqlar"],
    ["activity", "Faollik"],
    ["initiative", "Tashabbuskorlik"],
  ] as const;

  return (
    <main className="min-h-screen bg-[#eef8fc] text-[#10253a]">
      <SiteMenu />
      <section className="px-4 pb-16 pt-24 md:px-8 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0d9fca]">Ochiq metodologiya</p>
            <h1 className="mt-3 text-[42px] font-black leading-none tracking-[-0.05em] text-[#09263e] sm:text-[56px]">Bunyodkorlar reytingi</h1>
            <p className="mt-5 text-base font-medium leading-7 text-slate-600 md:text-lg">
              Reyting ensiklopediyada e’lon qilingan maqolalardagi qayd etilgan yutuqlar, faollik, tashabbuskorlik va tasdiqlovchi dalillar asosida avtomatik hisoblanadi.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-[#bfe3ed] bg-white px-4 py-2 text-xs font-extrabold text-[#087fa8]">
              Maqolalar avtomatik tahlil qilinadi • TOP 100
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-[#c3e5ef] bg-white p-2">
            {sorts.map(([value, label]) => (
              <Link
                key={value}
                href={`/reyting?sort=${value}`}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${sort === value || (sort === "leadership" && value === "initiative") ? "bg-[#0aa9d8] text-white" : "text-slate-500 hover:bg-[#eef9fd]"}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <section className="mt-8 overflow-hidden rounded-[28px] border border-[#bfe2ed] bg-white shadow-[0_20px_55px_rgba(28,111,140,.08)]">
            <div className="flex flex-col gap-2 border-b border-[#e1f0f5] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0d9fca]">Barcha vaqt</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">{rows.length ? `${rows.length} ta profil reytingda` : "Reyting hisoblanmoqda"}</h2>
              </div>
              <Link href="/sanjar-ai" className="text-sm font-extrabold text-[#087fa8]">Sanjar AI’dan so‘rash →</Link>
            </div>

            {rows.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {rows.map((row, index) => {
                  const article = row.article!;
                  const selectedScore = Number((row as unknown as Record<string, number>)[column] || 0);
                  return (
                    <article key={row.id} className="grid gap-4 px-5 py-5 transition hover:bg-[#f9fdff] sm:grid-cols-[56px_72px_1fr_auto] sm:items-center sm:px-7">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black ${index < 3 ? "bg-[#08263f] text-white" : "bg-[#e7f8fd] text-[#078eb7]"}`}>{index + 1}</div>
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                        {article.image_url ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs font-black text-slate-300">O‘zBYE</div>}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/bunyodkorlar/${article.slug}`} className="text-lg font-black tracking-[-0.02em] text-[#10253a] hover:text-[#007da8]">{article.title}</Link>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#0c9ac2]">{article.category || "Bunyodkor"}</p>
                        <div className="mt-3 grid max-w-2xl grid-cols-2 gap-2 text-[10px] font-extrabold text-slate-400 sm:grid-cols-4">
                          <span>Yutuq {Number(row.achievement_score).toFixed(1)}/60</span>
                          <span>Faollik {Number(row.activity_score).toFixed(1)}/20</span>
                          <span>Tashabbus {Number(row.leadership_score).toFixed(1)}/15</span>
                          <span>Dalil {Number(row.evidence_score).toFixed(1)}/5</span>
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
                <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-500">Maqolalardagi qayd etilgan natijalar avtomatik tahlil qilinib, tartiblanadi.</p>
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
            Reyting insonning umumiy qadrini baholamaydi. U faqat ensiklopediyada hujjatlashtirilgan faoliyat ko‘rsatkichlarini tartiblash vositasidir. Shaxsiy yoki sensitiv belgilar ballga ta’sir qilmaydi.
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
