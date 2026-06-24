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
    <main className="min-h-screen bg-white text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/tilda/images/tild3231-6436-4338-a534-366335323233__56517f45-cd2a-49fb-8.png"
              alt="O‘zbekiston Bunyodkor Yoshlari"
              className="h-14 w-auto max-w-[260px] object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-bold text-[#111827] lg:flex">
            <Link href="/haqida" className="hover:text-[#0043a4]">
              Biz haqimizda
            </Link>
            <Link href="#bunyodkorlar" className="hover:text-[#0043a4]">
              Bunyodkorlar Sahifasi
            </Link>
            <Link href="/tavsiyalari" className="hover:text-[#0043a4]">
              Tavsiyalar
            </Link>
            <Link href="/sahifasi" className="hover:text-[#0043a4]">
              Iqtiboslar
            </Link>
            <Link href="/ariza-qoldrish" className="hover:text-[#0043a4]">
              Ariza qoldirish
            </Link>
            <Link href="/hamkor-loyihasi" className="hover:text-[#0043a4]">
              Hamkor loyihasi
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative min-h-[720px] overflow-hidden bg-[#0b1628] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-75"
          style={{
            backgroundImage:
              "url('/tilda/images/tild6130-3635-4939-b332-343333356531__yangi_uzb.png')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col justify-center px-5 py-20">
          <div className="max-w-3xl">
            <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.14] tracking-[-0.035em] md:text-[48px] lg:text-[52px]">
              Bu yerda O‘zbekiston rivojiga munosib hissa qo‘shayotgan
              bunyodkor yoshlarning ismlari jamlangan
            </h1>

            <p className="mt-8 max-w-2xl text-xl font-semibold leading-relaxed text-white/95 md:text-2xl">
              Ular qatorida siz ham bo‘lishingiz mumkin, biz bilan bog‘laning!!!
            </p>

            <div className="mt-9 flex max-w-sm flex-col gap-4">
              <Link
                href="/ariza-qoldrish"
                className="rounded-full bg-[#0043a4] px-9 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl transition hover:bg-[#00327c]"
              >
                Ariza qoldirish
              </Link>

              <a
                href="https://t.me/UzBYE_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#0043a4] px-9 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl transition hover:bg-[#00327c]"
              >
                Bot orqali ariza qoldirish
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            <div className="rounded-[26px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <div className="mb-5 h-[2px] w-14 bg-white/80" />
              <h3 className="text-lg font-bold leading-snug">
                O‘zbekiston bunyodkorlari ensiklopediyasi: Kelajakni qurayotgan
                iqtidorlar maskani.
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Ushbu platforma mamlakatimizning eng yorqin va tashabbuskor
                yoshlari erishgan natijalarni bir nuqtaga birlashtiradi.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <div className="mb-5 h-[2px] w-14 bg-white/80" />
              <h3 className="text-lg font-bold leading-snug">
                Biz nimalar qilamiz?
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/82">
                O‘zbekiston bunyodkorlari haqidagi eng to‘liq va ishonchli
                ensiklopediya — bu nafaqat ma’lumot manbai, balki ilhom va
                rag‘batdir.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <div className="mb-5 h-[2px] w-14 bg-white/80" />
              <h3 className="text-lg font-bold leading-snug">
                O‘z kelajagingni biz bilan bunyod et!
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Mashhur bunyodkorlarimiz hayoti va faoliyati bilan tanishing,
                ularning qadamlarini izlang va o‘z kelajagingizni bunyod eting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="bunyodkorlar" className="bg-[#f2f2f2] px-5 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-5xl text-center">
            <h2 className="text-[36px] font-black uppercase leading-tight tracking-[-0.045em] text-[#111827] md:text-[58px]">
              ULAR QAYSI SOHALARDA?
            </h2>

            <p className="mx-auto mt-5 max-w-4xl text-base font-bold leading-8 text-[#0043a4] md:text-lg">
              Bu yerda faqat so‘nggi bunyodkorlar haqidagi ma’lumotlar
              ko‘rinadi. Qaysidir bunyodkorni qidirayotgan bo‘lsangiz,
              “Bunyodkorlar sahifasi”ga o‘ting yoki qidirish tugmasini bosing!
            </p>
          </div>

          <Link
            href="#bunyodkorlar"
            className="mb-12 block w-full bg-[#0043a4] px-8 py-5 text-center text-sm font-black uppercase tracking-[0.22em] text-white shadow-lg transition hover:bg-[#00327c]"
          >
            Bunyodkorlar sahifasiga o‘tish
          </Link>

          <PublicArticles articles={articles || []} />

          <div className="mt-20 bg-white px-6 py-16 md:px-12">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="max-w-2xl text-[46px] font-black leading-[0.95] tracking-[-0.05em] text-[#0043a4] md:text-[72px]">
                  Qoidalar bilan tanishing
                </h2>

                <div className="mt-16 space-y-0">
                  <div className="grid border-t-[7px] border-[#0043a4] py-7 md:grid-cols-[260px_1fr]">
                    <h3 className="text-3xl font-black leading-tight text-[#0043a4]">
                      Ariza qoldirish
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Web-sayt yoki ijtimoiy tarmoqlar orqali qoldirilgan
                      so‘rovnomani to‘ldirib ariza qoldiriladi.
                    </p>
                  </div>

                  <div className="grid border-t-[7px] border-[#0043a4] py-7 md:grid-cols-[260px_1fr]">
                    <h3 className="text-3xl font-black leading-tight text-[#0043a4]">
                      Siz bilan bog‘lanamiz
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Mutaxassislarimiz avval sizga qo‘ng‘iroq qilishadi va
                      keyin Telegramdan bog‘lanishadi.
                    </p>
                  </div>

                  <div className="grid border-t-[7px] border-[#0043a4] py-7 md:grid-cols-[260px_1fr]">
                    <h3 className="text-3xl font-black leading-tight text-[#0043a4]">
                      Ma’lumotlarni taqdim etish
                    </h3>
                    <p className="text-sm font-bold leading-6 text-black">
                      Ko‘rsatilgan maxsus shaklda ma’lumotlar taqdim etilgach,
                      nomzod ensiklopedik ahamiyatga mos ekanligi o‘rganilib,
                      bir xulosaga kelinadi. Agar ma’qullansa, 24 soat ichida
                      ijtimoiy tarmoq va saytga joylanadi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-end">
                <img
                  src="/tilda/images/tild3263-6635-4137-b135-643566303437__acsacs.png"
                  alt="O‘ZBYE"
                  className="w-full max-w-[430px] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}