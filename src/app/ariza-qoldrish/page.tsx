import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Ariza qoldirish",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga profil uchun ariza yuborish tartibi va ariza topshirish usullari.",
  alternates: { canonical: "/ariza-qoldrish" },
  openGraph: {
    title: "O‘zBYE — Ariza qoldirish",
    description: "Ensiklopedik profil uchun ariza yuboring va tahririyat bilan bog‘laning.",
    url: "/ariza-qoldrish",
  },
};

export default function ArizaQoldirishPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-16 pt-24 text-white md:px-8 md:pb-20 md:pt-28">
        <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#0043a4]/35 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">Ariza</p>
          <h1 className="mt-4 max-w-4xl text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[72px]">
            Bunyodkorlar safidan joy olish uchun ariza yuboring
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-white/70 md:text-lg md:leading-8">
            Arizada o‘zingiz haqingizdagi asosiy ma’lumotlar, faoliyat yo‘nalishingiz va eng muhim yutuqlaringizni taqdim etasiz. Tahririyat keyingi bosqich bo‘yicha siz bilan bog‘lanadi.
          </p>
        </div>
      </header>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[30px] border border-[#0043a4]/15 bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,.06)] md:p-9">
            <span className="inline-flex rounded-full bg-[#eaf2ff] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0043a4]">
              Tavsiya etiladi
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.04em]">Telegram bot orqali</h2>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 md:text-base md:leading-7">
              Eng qulay usul. Bot ariza jarayonini bosqichma-bosqich davom ettirish va keyingi aloqa uchun Telegram ichida qolish imkonini beradi.
            </p>
            <a
              href="https://t.me/UzBYE_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-full bg-[#0043a4] px-7 py-4 text-sm font-extrabold text-white transition hover:bg-[#003681]"
            >
              Botni ochish →
            </a>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,.04)] md:p-9">
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600">
              Web anketa
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.04em]">Brauzer orqali to‘ldirish</h2>
            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 md:text-base md:leading-7">
              Telegramdan foydalanishni istamasangiz, mavjud web-anketani yangi oynada ochib to‘ldirishingiz mumkin.
            </p>
            <a
              href="/tilda/ariza-qoldrish.html"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="mt-8 inline-flex rounded-full border border-[#0043a4]/25 px-7 py-4 text-sm font-extrabold text-[#0043a4] transition hover:bg-[#eef4ff]"
            >
              Web anketani ochish →
            </a>
          </article>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">Oldindan tayyorlang</p>
            <h2 className="mt-3 text-[36px] font-extrabold leading-[1.04] tracking-[-0.045em] md:text-[50px]">
              Arizada kerak bo‘ladigan asosiy ma’lumotlar
            </h2>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {[
              ["Shaxsiy ma’lumot", "Ism-familiya, tug‘ilgan sana yoki yil, hudud va aloqa ma’lumotlari."],
              ["Ta’lim va faoliyat", "O‘qish yoki ish joyi, mutaxassislik va asosiy faoliyat yo‘nalishi."],
              ["Yutuqlar", "Eng muhim tanlovlar, loyihalar, ilmiy ishlar, mukofotlar yoki tashabbuslar."],
              ["Portret", "Yuz aniq ko‘rinadigan, sifatli va ortiqcha yozuvlarsiz rasm."],
              ["Shaxsiy qarash", "Hayotiy prinsip, kelajak maqsadi va boshqalarga beradigan tavsiyangiz."],
            ].map(([title, text], index) => (
              <div key={title} className="grid gap-3 py-5 sm:grid-cols-[52px_190px_1fr]">
                <span className="text-xs font-extrabold text-[#0043a4]">0{index + 1}</span>
                <h3 className="font-extrabold text-[#111827]">{title}</h3>
                <p className="text-sm font-medium leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
