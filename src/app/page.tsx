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

      <section className="relative isolate overflow-hidden bg-white pt-[86px] sm:pt-[92px]">
        <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_82%_20%,rgba(111,162,255,.20),transparent_23%),radial-gradient(circle_at_5%_84%,rgba(104,199,255,.16),transparent_22%),radial-gradient(circle_at_95%_84%,rgba(172,126,255,.10),transparent_20%)]" />
        <div className="hero-blueprint pointer-events-none absolute inset-0 -z-20 opacity-70" />

        <div className="mx-auto grid min-h-[790px] max-w-[1480px] items-center gap-12 px-4 pb-8 pt-10 sm:px-6 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-0 lg:pb-2 lg:pt-8 xl:min-h-[825px]">
          <div className="relative z-30 max-w-[690px] pb-6 lg:pb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dce8ff] bg-[#f3f7ff]/90 px-4 py-2 text-[11px] font-extrabold text-[#3368d7] shadow-[0_8px_30px_rgba(40,92,190,.06)] backdrop-blur-md sm:text-[12px]">
              <span className="text-[15px]" aria-hidden="true">▣</span>
              O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
            </div>

            <h1 className="mt-7 max-w-[760px] text-[48px] font-black leading-[.96] tracking-[-0.058em] text-[#07132d] sm:text-[64px] md:text-[76px] lg:text-[66px] xl:text-[78px]">
              Kelajakni bunyod etayotgan{" "}
              <span className="relative inline-block bg-gradient-to-r from-[#1766ff] via-[#4275ff] to-[#6357ff] bg-clip-text text-transparent">
                yoshlar tarixi
                <span className="absolute -bottom-2 left-[8%] h-[5px] w-[88%] rotate-[-1deg] rounded-full bg-gradient-to-r from-[#1665ff] via-[#5a75ff] to-[#6d55ff] opacity-90" />
              </span>
            </h1>

            <p className="mt-8 max-w-[650px] text-[16px] font-semibold leading-7 text-[#66738b] sm:text-[18px] sm:leading-8">
              O‘zbekistonning faol, iqtidorli va tashabbuskor yoshlarining faoliyati, yutuqlari va hayot yo‘li bir raqamli ensiklopediyada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ariza-qoldirish"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[17px] bg-gradient-to-r from-[#1265ff] to-[#3459ff] px-7 py-4 text-[14px] font-black text-white shadow-[0_14px_36px_rgba(37,92,255,.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(37,92,255,.32)]"
              >
                Ariza qoldirish <span className="text-lg" aria-hidden="true">→</span>
              </Link>
              <Link
                href="/bunyodkorlar"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[17px] border border-[#e4eaf3] bg-white/88 px-7 py-4 text-[14px] font-black text-[#111a2c] shadow-[0_12px_34px_rgba(26,54,100,.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#cbd9f3]"
              >
                <span className="text-[#2866ff]" aria-hidden="true">▣</span>
                Ensiklopediyani ko‘rish
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-5 sm:gap-x-10">
              {stats.map(([value, label, icon]) => (
                <div key={label} className="flex min-w-[150px] items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[19px] font-black text-[#2866ff]">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[24px] font-black leading-none tracking-[-0.04em] text-[#0b1630]">
                      {Number(value).toLocaleString("uz-UZ")}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-[#8792a6]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex max-w-[670px] flex-wrap gap-2">
              {directions.map((direction) => (
                <Link
                  key={direction}
                  href="/bunyodkorlar"
                  className="rounded-full border border-[#e8edf5] bg-white/90 px-3.5 py-2 text-[10px] font-extrabold text-[#728099] shadow-[0_6px_20px_rgba(18,44,90,.035)] transition hover:border-[#bfd2ff] hover:text-[#2563ff]"
                >
                  {direction}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative mx-auto hidden h-[690px] w-full max-w-[820px] lg:block">
            <div className="hero-scene-glow absolute left-[13%] top-[8%] h-[570px] w-[570px] rounded-full bg-[radial-gradient(circle,rgba(79,128,255,.17),rgba(97,191,255,.06)_44%,transparent_72%)] blur-[2px]" />

            <UzbekistanHeroMap />

            <div className="hero-float-c absolute left-[5%] top-[8%] z-10 h-12 w-12 rotate-12 rounded-[15px] border border-white/80 bg-gradient-to-br from-[#92c9ff] to-[#7568ff] shadow-[0_18px_40px_rgba(66,109,238,.22)]" />
            <div className="hero-float-b absolute right-[2%] top-[2%] z-10 h-24 w-24 rotate-[28deg] rounded-[30px] border border-white/90 bg-gradient-to-br from-[#e2efff] via-[#b5c6ff] to-[#8879ff] opacity-80 shadow-[0_20px_45px_rgba(87,103,220,.18)]" />
            <div className="hero-float-a absolute bottom-[4%] left-[18%] z-10 h-11 w-11 rounded-full border-[13px] border-[#b9c9ff]/70 bg-white shadow-[0_14px_36px_rgba(72,98,195,.14)]" />

            <Link
              href="/reyting"
              className="hero-float-b absolute right-[13%] top-[6%] z-30 flex w-[190px] items-center gap-3 rounded-[22px] border border-white/90 bg-white/90 px-4 py-3.5 shadow-[0_20px_55px_rgba(35,80,157,.12)] backdrop-blur-xl"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3d9] text-xl">🏆</span>
              <div>
                <p className="text-[15px] font-black text-[#121a2e]">Reyting</p>
                <div className="mt-1 flex items-end gap-1">
                  {[10, 15, 21, 27].map((height) => (
                    <span key={height} className="w-2 rounded-t bg-[#8ba8ff]" style={{ height }} />
                  ))}
                </div>
              </div>
            </Link>

            <Link
              href="/bunyodkor-ai"
              className="hero-float-a absolute left-[2%] top-[48%] z-30 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/92 px-5 py-3 text-[13px] font-black text-[#17213a] shadow-[0_18px_48px_rgba(36,78,150,.12)] backdrop-blur-xl"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3575ff] to-[#765cff] text-white">✦</span>
              Bunyodkor AI
            </Link>

            <div className="hero-float-c absolute right-[0%] top-[53%] z-30 rounded-[20px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_18px_48px_rgba(36,78,150,.11)] backdrop-blur-xl">
              <p className="text-[11px] font-extrabold leading-4 text-[#44516b]">💡 G‘oyadan<br />amaliy natijaga</p>
            </div>

            <div className="hero-float-b absolute bottom-[5%] left-[48%] z-30 flex items-center gap-2 rounded-[18px] border border-white/90 bg-white/92 px-4 py-3 shadow-[0_16px_45px_rgba(36,78,150,.11)] backdrop-blur-xl">
              <span className="text-xl">🇺🇿</span>
              <p className="text-[10px] font-black leading-4 text-[#34415a]">Yangi avlod<br />Yangi O‘zbekiston</p>
            </div>

            {articles[0] && <HeroProfileCard article={articles[0]} large className="hero-float-a left-[39%] top-[31%]" />}
            {articles[1] && <HeroProfileCard article={articles[1]} className="hero-float-b left-[18%] top-[24%] rotate-[-4deg]" />}
            {articles[2] && <HeroProfileCard article={articles[2]} className="hero-float-c right-[1%] top-[34%] rotate-[3deg]" />}
            {articles[3] && <HeroProfileCard article={articles[3]} className="hero-float-b right-[11%] bottom-[1%] rotate-[4deg]" />}

            <div className="hero-float-c absolute bottom-[20%] left-[12%] z-30 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/90 bg-white/90 text-2xl text-[#3372ff] shadow-[0_16px_44px_rgba(31,75,155,.11)]">
              ▤
            </div>
          </div>

          <div className="relative mx-auto mt-2 w-full max-w-[560px] lg:hidden">
            <div className="relative mb-5 h-[330px] overflow-hidden rounded-[30px] border border-[#e4ebf7] bg-[radial-gradient(circle_at_70%_20%,rgba(104,154,255,.18),transparent_28%),linear-gradient(145deg,#fbfdff_0%,#f4f8ff_58%,#f7f3ff_100%)] shadow-[0_20px_55px_rgba(32,72,145,.10)]">
              <div className="hero-scene-glow absolute left-[12%] top-[8%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(79,128,255,.18),rgba(97,191,255,.06)_45%,transparent_72%)]" />
              <div className="absolute inset-[-8%] scale-[.86]">
                <UzbekistanHeroMap />
              </div>
              <div className="hero-float-b absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-2 text-[10px] font-black text-[#174a98] shadow-[0_10px_28px_rgba(40,88,170,.10)] backdrop-blur-xl">
                <span>🇺🇿</span>
                O‘zbekiston bo‘ylab bunyodkorlar
              </div>
              <div className="hero-float-a absolute bottom-4 right-4 z-20 rounded-[16px] border border-white/90 bg-white/92 px-3 py-2 text-[10px] font-black leading-4 text-[#34415a] shadow-[0_12px_32px_rgba(36,78,150,.10)] backdrop-blur-xl">
                Yangi avlod · Yangi O‘zbekiston
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {articles.slice(0, 4).map((article) => (
                <Link
                  href={"/bunyodkorlar/" + article.slug}
                  key={article.id}
                  className="rounded-[22px] border border-[#e7edf6] bg-white p-2 shadow-[0_16px_45px_rgba(33,71,132,.08)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#eef4fb]">
                    {article.image_url && <img src={article.image_url} alt={article.title} className="h-full w-full object-cover object-top" />}
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563ff] text-[10px] font-black text-white">✓</span>
                  </div>
                  <p className="mt-2 line-clamp-1 px-1 text-[12px] font-black text-[#131d32]">{article.title}</p>
                  <p className="mb-1 mt-1 line-clamp-1 px-1 text-[9px] font-bold text-slate-400">{profileCategory(article)}</p>
                </Link>
              ))}
            </div>
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
