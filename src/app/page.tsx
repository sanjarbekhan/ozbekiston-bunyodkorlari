import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PublicArticles from "@/components/PublicArticles";

export const revalidate = 60;

export default async function Home() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, category, image_url, description, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold text-red-600">Xatolik</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#111827]">
      <header className="absolute left-0 top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-start justify-between px-4 py-4 md:px-6">
          <details className="group relative">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur marker:hidden">
              <span className="relative block h-[2px] w-6 bg-black before:absolute before:left-0 before:top-[-8px] before:h-[2px] before:w-6 before:bg-black before:content-[''] after:absolute after:left-0 after:top-[8px] after:h-[2px] after:w-6 after:bg-black after:content-['']" />
            </summary>

            <div className="absolute left-0 top-16 w-[260px] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <Link
                href="/haqida"
                className="block border-b border-gray-100 px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Biz haqimizda
              </Link>

              <Link
                href="#bunyodkorlar"
                className="block border-b border-gray-100 px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Bunyodkorlar Sahifasi
              </Link>

              <Link
                href="/tavsiyalari"
                className="block border-b border-gray-100 px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Tavsiyalar
              </Link>

              <Link
                href="/sahifasi"
                className="block border-b border-gray-100 px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Iqtiboslar
              </Link>

              <Link
                href="/ariza-qoldrish"
                className="block border-b border-gray-100 px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Ariza qoldirish
              </Link>

              <Link
                href="/hamkor-loyihasi"
                className="block px-5 py-4 text-sm font-bold text-[#111827] hover:bg-[#0043a4] hover:text-white"
              >
                Hamkor loyihasi
              </Link>
            </div>
          </details>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b1628] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55 md:opacity-75"
          style={{
            backgroundImage:
              "url('/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png')",
          }}
        />

        <div className="absolute inset-0 bg-black/65 md:bg-gradient-to-r md:from-black/80 md:via-black/55 md:to-black/20" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-24 sm:pb-16 sm:pt-28 md:px-5 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-[-0.04em] sm:text-[36px] md:text-[52px]">
              Bu yerda O‘zbekiston rivojiga munosib hissa qo‘shayotgan
              bunyodkor yoshlarning ismlari jamlangan
            </h1>

            <p className="mt-5 text-base font-semibold leading-7 text-white/95 sm:text-xl md:mt-8 md:text-2xl">
              Ular qatorida siz ham bo‘lishingiz mumkin, biz bilan bog‘laning!!!
            </p>

            <div className="mt-7 flex w-[230px] flex-col gap-3 sm:w-[260px] md:mt-9 md:w-[340px]">
              <Link
                href="/ariza-qoldrish"
                className="rounded-full bg-[#0043a4] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-lg transition hover:bg-[#00327c] sm:text-[11px] md:px-6 md:py-4 md:text-sm"
              >
                Ariza qoldirish
              </Link>

              <a
                href="https://t.me/UzBYE_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#0043a4] px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-lg transition hover:bg-[#00327c] sm:text-[11px] md:px-6 md:py-4 md:text-sm"
              >
                Bot orqali ariza qoldirish
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-7 md:mt-16 md:grid-cols-3 md:gap-8">
            <div className="text-white">
              <div className="mb-3 h-[2px] w-10 bg-white/80 md:mb-5 md:w-14" />
              <h3 className="text-base font-extrabold leading-snug md:text-lg">
                O‘zbekiston bunyodkorlari ensiklopediyasi
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-white/90 md:leading-7">
                Kelajakni qurayotgan iqtidorlar maskani. Ushbu platforma
                mamlakatimizning eng yorqin va tashabbuskor yoshlari erishgan
                natijalarni bir nuqtaga birlashtiradi.
              </p>
            </div>

            <div className="text-white">
              <div className="mb-3 h-[2px] w-10 bg-white/80 md:mb-5 md:w-14" />
              <h3 className="text-base font-extrabold leading-snug md:text-lg">
                Biz nimalar qilamiz?
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-white/90 md:leading-7">
                O‘zbekiston bunyodkorlari haqidagi eng to‘liq va ishonchli
                ensiklopediya — bu nafaqat ma’lumot manbai, balki ilhom va
                rag‘batdir.
              </p>
            </div>

            <div className="text-white">
              <div className="mb-3 h-[2px] w-10 bg-white/80 md:mb-5 md:w-14" />
              <h3 className="text-base font-extrabold leading-snug md:text-lg">
                O‘z kelajagingni biz bilan bunyod et!
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-white/90 md:leading-7">
                Mashhur bunyodkorlarimiz hayoti va faoliyati bilan tanishing,
                ularning qadamlarini izlang va o‘z kelajagingizni bunyod eting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="bunyodkorlar" className="bg-[#f2f2f2] px-4 py-12 md:px-5 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-5xl text-center md:mb-10">
            <h2 className="text-[30px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-[#111827] sm:text-[42px] md:text-[58px]">
              ULAR QAYSI SOHALARDA?
            </h2>

            <p className="mx-auto mt-5 max-w-4xl text-sm font-bold leading-7 text-[#0043a4] md:text-lg md:leading-8">
              Bu yerda faqat so‘nggi bunyodkorlar haqidagi ma’lumotlar
              ko‘rinadi. Qaysidir bunyodkorni qidirayotgan bo‘lsangiz,
              “Bunyodkorlar sahifasi”ga o‘ting yoki qidirish tugmasini bosing!
            </p>
          </div>

          <Link
            href="#bunyodkorlar"
            className="mb-8 block w-full bg-[#0043a4] px-4 py-4 text-center text-[11px] font-black uppercase tracking-[0.08em] text-white shadow-lg transition hover:bg-[#00327c] sm:text-xs md:mb-12 md:px-8 md:py-5 md:text-sm md:tracking-[0.22em]"
          >
            Bunyodkorlar sahifasiga o‘tish
          </Link>

          <PublicArticles articles={articles || []} />

          <div className="mt-14 bg-white px-4 py-10 md:mt-20 md:px-12 md:py-16">
            <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-10">
              <div>
                <h2 className="text-[34px] font-black leading-[0.98] tracking-[-0.05em] text-[#0043a4] sm:text-[48px] md:text-[72px]">
                  Qoidalar bilan tanishing
                </h2>

                <div className="mt-8 md:mt-16">
                  <div className="border-t-[5px] border-[#0043a4] py-5 md:grid md:grid-cols-[260px_1fr] md:border-t-[7px] md:py-7">
                    <h3 className="mb-2 text-2xl font-black leading-tight text-[#0043a4] md:mb-0 md:text-3xl">
                      Ariza qoldirish
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Web-sayt yoki ijtimoiy tarmoqlar orqali qoldirilgan
                      so‘rovnomani to‘ldirib ariza qoldiriladi.
                    </p>
                  </div>

                  <div className="border-t-[5px] border-[#0043a4] py-5 md:grid md:grid-cols-[260px_1fr] md:border-t-[7px] md:py-7">
                    <h3 className="mb-2 text-2xl font-black leading-tight text-[#0043a4] md:mb-0 md:text-3xl">
                      Siz bilan bog‘lanamiz
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Mutaxassislarimiz avval sizga qo‘ng‘iroq qilishadi va
                      keyin Telegramdan bog‘lanishadi.
                    </p>
                  </div>

                  <div className="border-t-[5px] border-[#0043a4] py-5 md:grid md:grid-cols-[260px_1fr] md:border-t-[7px] md:py-7">
                    <h3 className="mb-2 text-2xl font-black leading-tight text-[#0043a4] md:mb-0 md:text-3xl">
                      Ma’lumotlarni taqdim etish
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Ko‘rsatilgan maxsus shaklda ma’lumotlar taqdim etilgach,
                      nomzod ensiklopedik ahamiyatga mos ekanligi o‘rganilib,
                      bir xulosaga kelinadi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-end">
                <img
                  src="/tilda/images/tild3263-6635-4137-b135-643566303437__acsacs.png"
                  alt="O‘ZBYE"
                  className="w-full max-w-[240px] object-contain sm:max-w-[320px] md:max-w-[430px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}