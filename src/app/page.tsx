import type { Metadata } from "next";
import Link from "next/link";
import PublicArticleCard from "@/components/PublicArticleCard";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import UzbekistanHeroMap from "@/components/UzbekistanHeroMap";
import { supabase } from "@/lib/supabase";
import { publicCategories } from "@/lib/public-format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
  description:
    "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlarning faoliyati, yutuqlari va hayot yo‘li jamlangan raqamli ensiklopediya.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi",
    description:
      "O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlarning faoliyati, yutuqlari va hayot yo‘li jamlangan raqamli ensiklopediya.",
  },
};

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

function profileCategory(article: HomeArticle) {
  return publicCategories(article.category)[0] || "Bunyodkor";
}

function HeroProfileCard({
  article,
  className,
  large = false,
}: {
  article: HomeArticle;
  className: string;
  large?: boolean;
}) {
  return (
    <Link
      href={"/bunyodkorlar/" + article.slug}
      className={
        "absolute z-20 overflow-hidden border border-white/90 bg-white/88 shadow-[0_24px_65px_rgba(31,74,150,.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(31,74,150,.22)] " +
        (large ? "w-[250px] rounded-[28px] p-2.5 sm:w-[280px]" : "w-[148px] rounded-[20px] p-2 sm:w-[166px]") +
        " " +
        className
      }
    >
      <div className={"relative overflow-hidden bg-[#eef4fb] " + (large ? "h-[270px] rounded-[21px] sm:h-[300px]" : "h-[118px] rounded-[15px] sm:h-[132px]")}>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="h-full w-full object-cover object-top"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-extrabold text-slate-400">
            Rasm mavjud emas
          </div>
        )}
        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#2563ff] text-[12px] font-black text-white shadow-[0_6px_18px_rgba(37,99,255,.34)]">
          ✓
        </span>
      </div>
      <div className={large ? "px-2 pb-2 pt-3" : "px-1.5 pb-1 pt-2.5"}>
        <p className={(large ? "text-[18px] " : "text-[12px] ") + "line-clamp-1 font-black tracking-[-0.035em] text-[#10182c]"}>
          {article.title}
        </p>
        <div className={"mt-1 flex items-center gap-1.5 font-extrabold text-[#687893] " + (large ? "text-[11px]" : "text-[9px]")}>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#edf4ff] text-[#2866ff]">✦</span>
          <span className="line-clamp-1">{profileCategory(article)}</span>
        </div>
        {large && (
          <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-slate-500">
            Faoliyati, yutuqlari va muhim natijalari ensiklopediyada jamlangan.
          </p>
        )}
      </div>
    </Link>
  );
}

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
    (categoryResult.data || []).flatMap((item) =>
      publicCategories(item.category).map((category) => category.toLocaleLowerCase("uz-UZ")),
    ),
  ).size;

  const stats = [
    [publishedResult.count ?? articles.length, "Nashr qilingan profil", "◎"],
    [categoryCount, "Faoliyat yo‘nalishi", "▦"],
    [monthResult.count ?? 0, "Shu oy qo‘shildi", "✦"],
  ] as const;

  const benefits = [
    ["Profilingizni yarating", "Faoliyatingiz, ta’limingiz va yutuqlaringizni yagona ensiklopedik sahifada jamlang."],
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

  const directions = ["Ta’lim", "Fan", "Texnologiya", "Tadbirkorlik", "Ijod", "Sport", "Volontyorlik"];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <SiteMenu />

      <section className="bg-white pt-[76px] sm:pt-[82px]">
      <div className="relative w-full overflow-hidden">
        <picture className="block w-full">
          <source media="(min-width: 1024px)" srcSet="/images/bunyodkor-hero-desktop.png" />
          <img
            src="/images/bunyodkor-hero-mobile.png"
            alt="O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi"
            className="block h-auto w-full"
            width={1080}
            height={1920}
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        <div className="absolute left-[39%] right-[5%] top-[72%] z-20 flex flex-col gap-2.5 lg:left-[5.5%] lg:right-auto lg:top-[36.5%] lg:flex-row lg:gap-3">
          <Link
            href="/ariza-qoldirish"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#245bff] px-4 py-2.5 text-center text-[11px] font-black text-white shadow-[0_8px_24px_rgba(36,91,255,.24)] transition hover:-translate-y-0.5 sm:text-xs lg:min-h-12 lg:rounded-2xl lg:px-6 lg:text-sm"
          >
            Ariza qoldirish
          </Link>
          <Link
            href="/bunyodkorlar"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#245bff]/30 bg-white/95 px-4 py-2.5 text-center text-[11px] font-black text-[#173a9a] shadow-[0_8px_24px_rgba(15,35,75,.10)] backdrop-blur transition hover:-translate-y-0.5 sm:text-xs lg:min-h-12 lg:rounded-2xl lg:px-6 lg:text-sm"
          >
            Ensiklopediyani ko‘rish
          </Link>
        </div>
      </div>
    </section>

      <section id="bunyodkorlar" className="relative bg-[#f8fbff] px-4 py-16 md:px-8 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[70%] -translate-x-1/2 bg-[radial-gradient(circle,rgba(82,132,255,.09),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2866ff]">Ensiklopediya</p>
              <h2 className="mt-3 max-w-3xl text-[38px] font-black leading-[1.02] tracking-[-0.05em] text-[#0c1830] sm:text-[50px] md:text-[58px]">
                Bunyodkor yoshlar bilan tanishing
              </h2>
            </div>
            <Link href="/bunyodkorlar" className="inline-flex items-center gap-2 text-sm font-black text-[#2866ff] hover:text-[#1745b4]">
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
                compact
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2866ff]">Nima uchun qo‘shilish kerak?</p>
            <h2 className="mt-3 text-[38px] font-black leading-[1.03] tracking-[-0.05em] text-[#0c1830] sm:text-[50px] md:text-[58px]">
              Yutuqlaringizni namoyon eting, kelajakka ilhom bering
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, text], index) => (
              <article key={title} className="rounded-[28px] border border-[#e6edf7] bg-white p-6 shadow-[0_12px_38px_rgba(25,54,105,.055)] transition hover:-translate-y-1 hover:border-[#c4d5f5] hover:shadow-[0_20px_48px_rgba(25,54,105,.09)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-gradient-to-br from-[#eef5ff] to-[#f3efff] text-sm font-black text-[#2866ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-black tracking-tight text-[#10203b]">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fbff] px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl rounded-[34px] border border-[#e3ebf6] bg-white p-6 shadow-[0_20px_65px_rgba(30,62,112,.06)] sm:p-8 md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2866ff]">Jarayon qanday?</p>
            <h2 className="mt-3 text-[36px] font-black leading-[1.04] tracking-[-0.05em] text-[#0c1830] sm:text-[48px] md:text-[56px]">
              Ariza topshirish juda oson
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {process.map(([number, title, text]) => (
              <article key={number} className="relative rounded-[24px] border border-[#e8edf5] bg-[#fbfdff] p-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1f6ff] text-sm font-black text-[#2866ff] shadow-[0_10px_28px_rgba(50,92,166,.10)]">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-black text-[#10203b]">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-[#dfe9fa] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_55%,#f5f1ff_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(38,73,145,.10)] sm:px-10 md:px-14 md:py-14">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#5f87ff]/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2866ff]">Siz ham bunyodkor bo‘lishingiz mumkin</p>
            <h2 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.045em] text-[#0c1830] sm:text-[44px]">
              O‘z hikoyangizni ensiklopediyada qoldiring
            </h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#65738c]">
              Faoliyatingiz, yutuqlaringiz va hayot yo‘lingizni tartibli raqamli profilda jamlang.
            </p>
            <Link href="/ariza-qoldirish" className="mt-7 inline-flex min-h-13 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#1265ff] to-[#4358ff] px-7 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(37,92,255,.22)] transition hover:-translate-y-0.5">
              Ariza qoldirish <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
