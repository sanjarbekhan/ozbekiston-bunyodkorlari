import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Hamkorlik",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bilan ta’lim, yoshlar, media va ijtimoiy loyihalar yo‘nalishida hamkorlik qilish imkoniyatlari.",
  alternates: { canonical: "/hamkor-loyihasi" },
  openGraph: {
    title: "O‘zBYE bilan hamkorlik",
    description: "Yoshlarni topish, hujjatlashtirish va tanitishga qaratilgan hamkorlik imkoniyatlari.",
    url: "/hamkor-loyihasi",
  },
};

const partners = [
  ["Ta’lim muassasalari", "Faol o‘quvchi va talabalarni tavsiya qilish, ularning yutuqlarini hujjatlashtirish va targ‘ib etish."],
  ["Yoshlar tashkilotlari", "Hududiy yoki mavzuli tashabbuslarda faol yoshlarni aniqlash va ensiklopedik profillar orqali ko‘rsatish."],
  ["Media va loyihalar", "Yoshlarning tajribasi, hikoyalari va natijalarini sifatli kontent hamda qo‘shma axborot loyihalarida yoritish."],
];

export default function HamkorLoyihasiPage() {
  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-16 pt-24 text-white md:px-8 md:pb-20 md:pt-28">
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[#0043a4]/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">Hamkorlik</p>
          <h1 className="mt-4 max-w-5xl text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[72px]">
            Bunyodkor yoshlarni birgalikda topamiz, hujjatlashtiramiz va tanitamiz
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-white/70 md:text-lg md:leading-8">
            O‘zBYE ta’lim muassasalari, yoshlar tashkilotlari, loyihalar va media tashabbuslari bilan mazmunli hamkorlikka ochiq.
          </p>
        </div>
      </header>

      <section className="bg-[#f4f7fb] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {partners.map(([title, text], index) => (
              <article key={title} className="rounded-[28px] border border-slate-200 bg-white p-7 md:p-8">
                <span className="text-xs font-extrabold text-[#0043a4]">0{index + 1}</span>
                <h2 className="mt-8 text-2xl font-extrabold leading-tight tracking-[-0.03em]">{title}</h2>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">Hamkorlik tamoyili</p>
            <h2 className="mt-3 max-w-3xl text-[36px] font-extrabold leading-[1.04] tracking-[-0.045em] md:text-[52px]">
              Hamkorlik logotip almashish emas, yoshlar uchun real qiymat yaratishi kerak
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-slate-600">
              Qo‘shma ishning markazida yoshlarni topish, ularning natijalarini ishonchli shaklda saqlash va keng auditoriyaga foydali tarzda yetkazish turadi.
            </p>
          </div>

          <div className="rounded-[32px] bg-[#071426] p-8 text-white md:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50">Bog‘lanish</p>
            <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em]">
              Hamkorlik g‘oyangizni qisqacha yozib yuboring.
            </h3>
            <p className="mt-4 text-sm font-medium leading-6 text-white/65">
              Tashkilot yoki loyiha nomi, hamkorlik g‘oyasi va kutilayotgan natijani yozsangiz, muloqotni aniqroq boshlash mumkin bo‘ladi.
            </p>
            <a
              href="https://t.me/UzBYE_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex rounded-full bg-[#0043a4] px-6 py-3.5 text-sm font-extrabold text-white"
            >
              Telegram orqali bog‘lanish →
            </a>
            <Link href="/haqida" className="ml-4 mt-7 inline-flex text-sm font-extrabold text-white/70 hover:text-white">
              Loyiha haqida
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
