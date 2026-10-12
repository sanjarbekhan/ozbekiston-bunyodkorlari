import type { Metadata } from "next";
import PublicArticles from "@/components/PublicArticles";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bunyodkorlar katalogi",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasidagi barcha e’lon qilingan biografik profillarni ism, soha va kalit so‘z bo‘yicha toping.",
  alternates: { canonical: "/bunyodkorlar" },
  openGraph: {
    title: "Bunyodkorlar katalogi",
    description:
      "O‘zbekistonning turli sohalarida faol bo‘lgan bunyodkor yoshlar profillari.",
    url: "/bunyodkorlar",
  },
};

export default async function BunyodkorlarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialSearch = (params.q || "").trim().slice(0, 120);

  const { data: articles } = await supabase
    .from("articles")
    .select("id,title,slug,category,image_url,description,published_at,created_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-white px-4 pb-14 pt-28 md:px-8 md:pb-18 md:pt-32">
        <div className="absolute right-[-10%] top-0 h-80 w-80 rounded-full bg-[#5b86ff]/12 blur-3xl" />
        <div className="hero-blueprint absolute inset-0 opacity-35" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#2866ff]">
            Ensiklopediya katalogi
          </p>
          <h1 className="mt-3 text-[44px] font-black leading-[.98] tracking-[-.055em] text-[#0b1630] sm:text-[58px] md:text-[72px]">
            Bunyodkorlar
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[#65738c] md:text-lg md:leading-8">
            Barcha profillarni ism, familiya, faoliyat sohasi yoki kalit so‘z orqali qidiring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-[#64738d]">
            <span className="rounded-full border border-[#e4ebf5] bg-white px-4 py-2 shadow-sm">
              {articles?.length || 0} ta profil
            </span>
            <span className="rounded-full border border-[#e4ebf5] bg-white px-4 py-2 shadow-sm">
              Barcha hududlar
            </span>
            <span className="rounded-full border border-[#e4ebf5] bg-white px-4 py-2 shadow-sm">
              Turli yo‘nalishlar
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <PublicArticles articles={articles || []} initialSearch={initialSearch} />
      </section>

      <SiteFooter />
    </main>
  );
}
