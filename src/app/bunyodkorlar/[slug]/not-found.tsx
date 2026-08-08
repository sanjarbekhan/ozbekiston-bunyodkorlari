import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Maqola hozirda mavjud emas",
  robots: { index: false, follow: false },
};

export default function ArticleNotFound() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <section className="flex min-h-[78vh] items-center px-4 pb-16 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[34px] border border-white/60 bg-[radial-gradient(circle_at_15%_20%,rgba(178,214,255,.8),transparent_34%),radial-gradient(circle_at_80%_25%,rgba(255,190,145,.85),transparent_34%),radial-gradient(circle_at_45%_90%,rgba(255,219,151,.8),transparent_35%),#f3e5dc] p-6 shadow-[0_24px_80px_rgba(15,23,42,.10)] sm:p-10 md:p-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#0043a4] backdrop-blur">
              404 · Profil mavjud emas
            </span>

            <h1 className="mt-7 text-4xl font-black leading-[1.03] tracking-[-0.05em] text-[#111827] sm:text-5xl md:text-6xl">
              Ushbu maqola hozirda mavjud emas
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-7 text-slate-700 md:text-lg md:leading-8">
              Mazkur profilning ensiklopediyadagi nashr holati vaqtincha to‘xtatilgan yoki sahifa mavjud emas. Qo‘shimcha ma’lumot uchun loyiha ma’muriyati bilan bog‘lanishingiz mumkin.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/bunyodkorlar"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#0043a4] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#003681]"
              >
                Bunyodkorlar katalogiga qaytish
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/80 bg-white/65 px-6 py-3 text-sm font-extrabold text-[#111827] backdrop-blur transition hover:bg-white"
              >
                Bosh sahifa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
