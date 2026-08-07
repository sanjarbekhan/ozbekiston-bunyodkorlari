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

export default async function BunyodkorlarPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("id,title,slug,category,image_url,description,published_at,created_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-14 pt-24 text-white md:px-8 md:pb-18 md:pt-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#0043a4]/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">
            Ensiklopediya katalogi
          </p>
          <h1 className="mt-3 text-[44px] font-extrabold leading-[.98] tracking-[-.05em] sm:text-[58px] md:text-[72px]">
            Bunyodkorlar
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/70 md:text-lg md:leading-8">
            Barcha profillarni ism, familiya, faoliyat sohasi yoki kalit so‘z orqali qidiring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/65">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              {articles?.length || 0} ta profil
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              Barcha hududlar
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              Turli yo‘nalishlar
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <PublicArticles articles={articles || []} />
      </section>

      <SiteFooter />
    </main>
  );
}
