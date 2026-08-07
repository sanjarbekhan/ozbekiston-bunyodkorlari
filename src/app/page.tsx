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
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(12);

  if (error) {
    return (
      <main className="min-h-screen bg-white p-8 text-[#111827]">
        <h1 className="text-2xl font-bold">Sahifani yuklab bo‘lmadi</h1>
        <p className="mt-2 text-slate-600">Iltimos, birozdan so‘ng qayta urinib ko‘ring.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <SiteMenu />

      <section className="relative overflow-hidden bg-[#0b1628] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55 md:opacity-70"
          style={{
            backgroundImage:
              "url('/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png')",
          }}
        />
        <div className="absolute inset-0 bg-[#071426]/72 md:bg-gradient-to-r md:from-[#071426]/95 md:via-[#071426]/70 md:to-[#071426]/30" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 sm:pb-16 sm:pt-28 md:px-8 md:py-28">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/65 sm:text-sm">
              O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi
            </p>
            <h1 className="max-w-4xl text-[31px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[40px] md:text-[58px] lg:text-[66px]">
              O‘zbekiston rivojiga munosib hissa qo‘shayotgan bunyodkor yoshlar
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-white/82 sm:text-lg md:text-xl md:leading-8">
              Ularning faoliyati, yutuqlari va hayot yo‘li bir joyda jamlanadi.
              Siz ham bunyodkorlar safidan joy olishingiz mumkin.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
              <Link
                href="/ariza-qoldrish"
                className="rounded-full bg-[#0043a4] px-7 py-4 text-center text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(0,67,164,.28)] transition hover:bg-[#003681]"
              >
                Ariza qoldirish
              </Link>

              <a
                href="https://t.me/UzBYE_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/45 bg-white/8 px-7 py-4 text-center text-sm font-extrabold text-white backdrop-blur transition hover:bg-white hover:text-[#071426]"
              >
                Telegram bot orqali
              </a>
            </div>
          </div>

          <div className="mt-12 grid gap-7 border-t border-white/15 pt-9 md:mt-18 md:grid-cols-3 md:gap-10 md:pt-10">
            <div>
              <p className="text-sm font-extrabold text-white">Ensiklopedik xotira</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/68">
                Yoshlarning muhim natijalari va faoliyati tartibli, qidirish mumkin bo‘lgan profillarda jamlanadi.
              </p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Ishonchli ma’lumot</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/68">
                Taqdim etilgan ma’lumotlar ensiklopedik formatga moslab tahrir qilinadi va nashrga tayyorlanadi.
              </p>
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">Ilhom va namuna</p>
              <p className="mt-2 text-sm font-medium leading-6 text-white/68">
                Turli sohalardagi tengdoshlar tajribasi yangi maqsadlar va tashabbuslar uchun yo‘l ko‘rsatadi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="bunyodkorlar" className="bg-[#f4f7fb] px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">
                So‘nggi profillar
              </p>
              <h2 className="mt-3 max-w-3xl text-[36px] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[48px] md:text-[58px]">
                Bunyodkor yoshlar bilan tanishing
              </h2>
            </div>
            <p className="max-w-lg text-sm font-medium leading-6 text-slate-600 md:text-right md:text-base md:leading-7">
              Bu yerda eng yangi profillar ko‘rsatiladi. Ism, soha yoki kalit so‘z bo‘yicha qidirish uchun to‘liq katalogdan foydalaning.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(articles || []).map((article: HomeArticle) => (
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

          <div className="mt-10 flex justify-center">
            <Link
              href="/bunyodkorlar"
              className="rounded-full bg-[#0043a4] px-7 py-4 text-sm font-extrabold text-white transition hover:bg-[#003681]"
            >
              Barcha bunyodkorlarni ko‘rish →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">
              Jarayon
            </p>
            <h2 className="mt-3 text-[38px] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[52px] md:text-[64px]">
              Qoidalar bilan tanishing
            </h2>

            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["01", "Ariza qoldirish", "Sayt yoki Telegram bot orqali ariza yuborasiz."],
                ["02", "Siz bilan bog‘lanamiz", "Tahririyat kerakli ma’lumotlarni aniqlashtirish uchun siz bilan bog‘lanadi."],
                ["03", "Ma’lumotlarni taqdim etish", "Ma’lumotlar ensiklopedik ahamiyat va tahrir mezonlari asosida ko‘rib chiqiladi."],
              ].map(([number, title, text]) => (
                <div key={number} className="grid gap-3 py-6 sm:grid-cols-[64px_220px_1fr] sm:items-start">
                  <span className="text-sm font-extrabold text-[#0043a4]">{number}</span>
                  <h3 className="text-xl font-extrabold tracking-tight text-[#111827]">{title}</h3>
                  <p className="text-sm font-medium leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end">
            <div className="rounded-[32px] bg-[#f4f7fb] p-10 sm:p-14">
              <img
                src="/tilda/images/ozbye-new-logo.svg"
                alt="O‘zbekiston Bunyodkor Yoshlari"
                className="w-full max-w-[300px] object-contain md:max-w-[380px]"
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
