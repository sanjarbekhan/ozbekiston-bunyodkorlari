import Link from "next/link";
import PublicArticleCard from "@/components/PublicArticleCard";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type HomeArticle = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  published_at: string | null;
  created_at: string;
};

export default async function Home() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const [articlesResult, publishedResult, categoryResult, monthResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, category, image_url, description, published_at, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("articles")
      .select("category")
      .eq("status", "published")
      .not("category", "is", null),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", monthStart),
  ]);

  if (articlesResult.error) {
    return (
      <main className="min-h-screen bg-white p-8 text-[#111827]">
        <h1 className="text-2xl font-bold">Sahifani yuklab bo‘lmadi</h1>
        <p className="mt-2 text-slate-600">Iltimos, birozdan so‘ng qayta urinib ko‘ring.</p>
      </main>
    );
  }

  const articles = (articlesResult.data || []) as HomeArticle[];
  const categoryCount = new Set(
    (categoryResult.data || [])
      .map((item) => item.category?.trim())
      .filter((value): value is string => Boolean(value)),
  ).size;

  const stats = [
    [publishedResult.count ?? articles.length, "Nashr qilingan profil", "◉"],
    [categoryCount, "Faoliyat yo‘nalishi", "✦"],
    [monthResult.count ?? 0, "Shu oy qo‘shildi", "◇"],
  ] as const;

  const benefits = [
    ["Profilingizni yarating", "O‘z faoliyatingiz, ta’limingiz va yutuqlaringizni yagona ensiklopedik sahifada jamlang."],
    ["Keng auditoriyaga chiqing", "Profilingiz qidiruv tizimlari, ulashiladigan havolalar va QR orqali oson topiladi."],
    ["E’tirof va e’tibor", "Faoliyatingiz hamda yutuqlaringiz tartibli, rasmiy va tushunarli formatda namoyon bo‘ladi."],
    ["Tarmoq va imkoniyatlar", "Boshqa bunyodkor yoshlar, sohalar va yangi imkoniyatlar bilan tanishish osonlashadi."],
  ] as const;

  const process = [
    ["01", "Ariza yuboring", "Sayt orqali qisqa arizani to‘ldirasiz."],
    ["02", "Ko‘rib chiqish", "Tahririyat ma’lumotlaringizni ko‘rib chiqadi."],
    ["03", "Tasdiqlash", "Kerakli ma’lumotlar aniqlashtiriladi va tasdiqlanadi."],
    ["04", "Nashr qilish", "Profilingiz ensiklopediyada rasmiy ravishda e’lon qilinadi."],
  ] as const;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f8fc] text-[#111827]">
      <SiteMenu />

      <section className="relative isolate overflow-hidden bg-[#06182d] pt-[74px] text-white">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-[position:68%_center] sm:bg-[position:65%_center] lg:bg-[position:72%_center]"
          style={{ backgroundImage: "url('/images/bunyodkor-hero.webp?v=2')" }}
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(3,17,34,.96)_0%,rgba(4,24,45,.91)_35%,rgba(4,28,53,.68)_57%,rgba(4,25,47,.26)_78%,rgba(3,18,34,.10)_100%)]" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_76%_24%,rgba(62,144,255,.18),transparent_34%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#06182d] via-[#06182d]/55 to-transparent" />

        <div className="mx-auto flex min-h-[650px] max-w-7xl flex-col justify-end px-4 pb-8 pt-16 sm:min-h-[690px] sm:justify-center sm:pb-10 sm:pt-20 md:px-8 lg:min-h-[720px] lg:pb-12">
          <div className="max-w-[800px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 shadow-[0_10px_35px_rgba(0,0,0,.12)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#55a8ff] shadow-[0_0_14px_rgba(85,168,255,.9)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/78 sm:text-[11px]">
                O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
              </p>
            </div>

            <h1 className="max-w-4xl text-[42px] font-black leading-[.98] tracking-[-0.05em] text-white sm:text-[56px] md:text-[68px] lg:text-[78px]">
              Kelajakni bunyod etayotgan{" "}
              <span className="bg-gradient-to-r from-[#70b7ff] via-[#4f91ff] to-[#7b7dff] bg-clip-text text-transparent">
                yoshlar tarixi
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] font-medium leading-7 text-white/78 sm:text-lg md:text-[20px] md:leading-8">
              O‘zbekiston rivojiga munosib hissa qo‘shayotgan yoshlarning faoliyati, yutuqlari va hayot yo‘li yagona raqamli ensiklopediyada jamlanadi.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
              <Link
                href="/ariza-qoldrish"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#1677ff] to-[#4457f4] px-8 py-4 text-[14px] font-black text-white shadow-[0_16px_40px_rgba(31,111,255,.34)] ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(31,111,255,.44)] sm:min-w-[215px]"
              >
                Ariza qoldirish
                <span className="text-lg" aria-hidden="true">→</span>
              </Link>

              <Link
                href="/bunyodkorlar"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-white/18 bg-white/[0.08] px-7 py-4 text-[14px] font-black text-white shadow-[0_12px_30px_rgba(0,0,0,.12)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.14]"
              >
                Ensiklopediyani ko‘rish
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/14 bg-[#071b33]/45 p-2 shadow-[0_26px_80px_rgba(0,0,0,.20)] backdrop-blur-xl sm:mt-14 lg:mt-16">
            <div className="grid gap-1 sm:grid-cols-3">
              {stats.map(([value, label, icon]) => (
                <div
                  key={label}
                  className="group flex items-center gap-4 rounded-[22px] px-5 py-4 transition hover:bg-white/[0.07] md:px-7 md:py-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-lg text-[#83b8ff] shadow-inner">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[28px] font-black leading-none tracking-[-0.04em] text-white md:text-[34px]">
                      {Number(value).toLocaleString("uz-UZ")}
                    </p>
                    <p className="mt-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white/55 sm:text-[10px]">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="bunyodkorlar" className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2166e8]">Ensiklopediya</p>
              <h2 className="mt-3 max-w-3xl text-[38px] font-black leading-[1.02] tracking-[-0.045em] text-[#10233d] sm:text-[50px] md:text-[58px]">
                Bunyodkor yoshlar bilan tanishing
              </h2>
            </div>
            <Link href="/bunyodkorlar" className="inline-flex items-center gap-2 text-sm font-black text-[#2166e8] hover:text-[#1248aa]">
              Barchasini ko‘rish <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {articles.slice(0, 4).map((article) => (
              <PublicArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                imageUrl={article.image_url}
                category={article.category}
                description={article.description}
                date={article.published_at || article.created_at}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2166e8]">Nima uchun qo‘shilish kerak?</p>
            <h2 className="mt-3 text-[38px] font-black leading-[1.03] tracking-[-0.045em] text-[#10233d] sm:text-[50px] md:text-[58px]">
              Yutuqlaringizni namoyon eting, kelajakka ilhom bering
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, text], index) => (
              <article key={title} className="rounded-[26px] border border-[#e4ebf4] bg-[#fbfdff] p-6 shadow-[0_10px_35px_rgba(15,35,65,.04)] transition hover:-translate-y-1 hover:border-[#b9cff5] hover:shadow-[0_18px_45px_rgba(15,35,65,.08)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4ff] text-lg font-black text-[#2166e8]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-black tracking-tight text-[#10233d]">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl rounded-[34px] border border-[#dfe8f3] bg-white p-6 shadow-[0_18px_60px_rgba(20,48,82,.06)] sm:p-8 md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2166e8]">Jarayon qanday?</p>
            <h2 className="mt-3 text-[36px] font-black leading-[1.04] tracking-[-0.045em] text-[#10233d] sm:text-[48px] md:text-[56px]">
              Ariza topshirish juda oson
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {process.map(([number, title, text]) => (
              <article key={number} className="relative rounded-[24px] border border-[#e6edf5] bg-[#f9fbfe] p-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-black text-[#2166e8] shadow-[0_10px_30px_rgba(32,86,170,.12)] ring-1 ring-[#dce8f8]">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-black text-[#10233d]">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[34px] bg-[#0a2a4c] px-6 py-10 text-white shadow-[0_24px_70px_rgba(10,42,76,.20)] sm:px-10 md:px-14 md:py-14">
          <div className="absolute inset-y-0 right-0 hidden w-[45%] bg-[url('/images/bunyodkor-hero.webp')] bg-cover bg-center opacity-20 md:block" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7fb0ff]">Siz ham bunyodkor bo‘lishingiz mumkin</p>
            <h2 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.04em] sm:text-[44px]">
              O‘z hikoyangizni ensiklopediyada qoldiring
            </h2>
            <p className="mt-4 max-w-xl text-base font-medium leading-7 text-white/72">
              Faoliyatingiz, yutuqlaringiz va hayot yo‘lingizni tartibli raqamli profilda jamlang.
            </p>
            <Link href="/ariza-qoldrish" className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-2xl bg-[#1976ff] px-7 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0f63df]">
              Ariza qoldirish <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
