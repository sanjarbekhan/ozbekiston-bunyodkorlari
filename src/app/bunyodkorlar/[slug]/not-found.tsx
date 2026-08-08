import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nomzod safidan chiqarilgan",
  robots: { index: false, follow: false },
};

export default function ArticleNotFound() {
  return (
    <main className="min-h-screen bg-white p-0 text-white">
      <section className="flex min-h-screen w-full items-center justify-center overflow-hidden rounded-b-[26px] bg-[radial-gradient(circle_at_7%_46%,rgba(212,231,239,.95),transparent_32%),radial-gradient(circle_at_48%_44%,rgba(255,169,38,.96),transparent_34%),radial-gradient(circle_at_82%_38%,rgba(255,122,88,.9),transparent_38%),linear-gradient(100deg,#d7e7eb_0%,#f6ca62_28%,#ff9b2f_52%,#f2a7a1_100%)] px-5 py-10 sm:px-10 md:px-16">
        <div className="mx-auto flex min-h-[78vh] w-full max-w-[1200px] flex-col items-center justify-center text-center">
          <h1 className="max-w-[900px] text-[32px] font-black leading-[1.28] tracking-[-0.035em] drop-shadow-[0_1px_1px_rgba(0,0,0,.04)] sm:text-[42px] md:text-[52px] lg:text-[58px]">
            Ushbu shaxs kelishilgan loyiha oldidagi majburiyatlarini bajarmagani va badal pullarini to‘lashdan bo‘yin tovlagani sababli yoxud o‘z ixtiyori bilan “O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi” nomzodlari safidan chiqarildi.
          </h1>

          <p className="mt-10 max-w-[900px] text-base font-semibold leading-7 text-white/95 sm:text-lg md:mt-12 md:text-xl">
            Mazkur holat inobatga olinib, u loyiha ma’muriyatining ichki qora ro‘yxatiga kiritildi.
          </p>
        </div>
      </section>
    </main>
  );
}
