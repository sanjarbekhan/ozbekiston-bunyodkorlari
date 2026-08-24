import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Biz haqimizda",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining maqsadi, tamoyillari va ishlash tartibi haqida.",
  alternates: { canonical: "/haqida" },
  openGraph: {
    title: "O‘zBYE haqida",
    description:
      "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining maqsadi va faoliyati bilan tanishing.",
    url: "/haqida",
  },
};

const values = [
  {
    number: "01",
    title: "Tizimlilik",
    text: "Biografiya, faoliyat, yutuqlar va loyihalar bir xil ensiklopedik tartibda jamlanadi.",
  },
  {
    number: "02",
    title: "Ishonchlilik",
    text: "Ma’lumotlar tushunarli, aniq va imkon qadar tasdiqlovchi manbalar bilan beriladi.",
  },
  {
    number: "03",
    title: "Ochiqlik",
    text: "Har bir profil qidirish, o‘qish va ulashish uchun qulay bo‘lgan ochiq raqamli sahifa sifatida taqdim etiladi.",
  },
];

const directions = [
  "Ta’lim",
  "Fan",
  "Texnologiya",
  "Ijod",
  "Sport",
  "Tadbirkorlik",
  "Volontyorlik",
  "Loyihalar",
];

const process = [
  {
    number: "01",
    title: "Ariza",
    text: "Nomzod o‘zi yoki tavsiya orqali platformaga murojaat qiladi.",
  },
  {
    number: "02",
    title: "Tahrir va tekshiruv",
    text: "Ma’lumotlar aniqlashtiriladi, tartiblanadi va ensiklopedik formatga keltiriladi.",
  },
  {
    number: "03",
    title: "Nashr",
    text: "Tayyor profil platformada qidirish va ulashish mumkin bo‘lgan sahifa sifatida e’lon qilinadi.",
  },
];

export default function HaqidaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-14 pt-20 text-white sm:pb-18 sm:pt-24 md:px-8 md:pb-20 md:pt-28">
        <div className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-[#0f68ff]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-44 left-[18%] h-[360px] w-[360px] rounded-full bg-[#10c8e8]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/65 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#23d7f0]" />
              O‘zBYE haqida
            </div>

            <h1 className="mt-6 max-w-5xl text-[40px] font-black leading-[0.98] tracking-[-0.05em] sm:text-[52px] md:text-[64px] lg:text-[68px]">
              Bunyodkor yoshlarning yutuqlarini tarixda qoldiramiz
            </h1>

            <p className="mt-6 max-w-3xl text-[15px] font-medium leading-7 text-white/68 sm:text-base md:text-lg md:leading-8">
              O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi — ta’lim, fan, texnologiya, ijod, sport, tadbirkorlik va boshqa yo‘nalishlarda natija ko‘rsatayotgan yoshlar haqidagi raqamli ensiklopedik platforma.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/bunyodkorlar"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-[#071426] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]"
              >
                Ensiklopediyani ko‘rish →
              </Link>
              <Link
                href="/ariza-qoldrish"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] px-6 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              >
                Ariza qoldirish
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-xl lg:max-w-none">
            {[
              ["01", "Biografiya"],
              ["02", "Yutuqlar"],
              ["03", "Loyihalar"],
              ["04", "Faoliyat"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-5"
              >
                <span className="text-[10px] font-black tracking-[0.18em] text-[#44d7ee]">{number}</span>
                <p className="mt-4 text-sm font-extrabold text-white/90 sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="px-4 py-14 sm:py-16 md:px-8 md:py-22">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0043a4]">
                Asosiy maqsad
              </p>
              <h2 className="mt-4 max-w-xl text-[34px] font-black leading-[1.03] tracking-[-0.045em] sm:text-[42px] md:text-[50px]">
                Yoshlarning faoliyati va yutuqlarini bir platformada jamlash
              </h2>
            </div>

            <div>
              <div className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6 sm:p-8 md:p-9">
                <p className="text-base font-semibold leading-8 text-slate-700 md:text-lg">
                  Platformada ta’lim, fan, texnologiya, ijod, sport, tadbirkorlik, volontyorlik va boshqa yo‘nalishlarda faol yoshlarning biografiyasi, yutuqlari, loyihalari va tashabbuslari jamlanadi.
                </p>
                <p className="mt-5 text-base font-medium leading-8 text-slate-600 md:text-lg">
                  Har bir profil shaxsning ta’lim yo‘li, faoliyati, erishgan natijalari va muhim yutuqlari haqida tizimli va ensiklopedik ma’lumot taqdim etadi.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {directions.map((direction) => (
                  <span
                    key={direction}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600 shadow-[0_4px_14px_rgba(15,23,42,.04)]"
                  >
                    {direction}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7fb] px-4 py-14 sm:py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0043a4]">Tamoyillarimiz</p>
              <h2 className="mt-3 text-[32px] font-black tracking-[-0.04em] sm:text-[40px]">
                Ensiklopedik yondashuv
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-6 text-slate-500 sm:text-right">
              Maqsad — yoshlar haqidagi ma’lumotni chiroyli ko‘rsatishdan ko‘ra, uni tartibli, tushunarli va uzoq muddat foydalaniladigan shaklda saqlash.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map((item) => (
              <article
                key={item.number}
                className="group rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,.08)] sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-xs font-black text-[#0043a4]">
                  {item.number}
                </div>
                <h3 className="mt-7 text-2xl font-black tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:py-16 md:px-8 md:py-22">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0043a4]">Qanday ishlaydi?</p>
            <h2 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.045em] sm:text-[42px] md:text-[50px]">
              Arizadan ensiklopedik profilgacha
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {process.map((item, index) => (
              <article
                key={item.number}
                className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-[0.18em] text-[#0043a4]">{item.number}</span>
                  {index < process.length - 1 && (
                    <span className="hidden text-lg font-black text-slate-200 md:block">→</span>
                  )}
                </div>
                <h3 className="mt-10 text-xl font-black tracking-[-0.025em]">{item.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#071426] px-6 py-10 text-white sm:px-9 sm:py-12 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#0f68ff]/30 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Siz ham qatnashing</p>
              <h2 className="mt-4 max-w-3xl text-[30px] font-black leading-[1.08] tracking-[-0.04em] sm:text-[38px] md:text-[44px]">
                Yutuqlaringizni ensiklopedik profil sifatida taqdim eting
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-white/60 md:text-base">
                Ariza yuboring. Tahririyat ma’lumotlaringizni ko‘rib chiqib, keyingi bosqich bo‘yicha siz bilan bog‘lanadi.
              </p>
            </div>
            <Link
              href="/ariza-qoldrish"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 text-sm font-extrabold text-[#071426] transition hover:-translate-y-0.5 hover:bg-[#eef5ff]"
            >
              Ariza qoldirish →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
