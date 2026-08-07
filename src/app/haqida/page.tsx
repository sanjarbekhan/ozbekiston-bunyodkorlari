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
    title: "Hujjatlashtirish",
    text: "Yoshlarning muhim yutuqlari, faoliyati va hayot yo‘lini tartibli ensiklopedik profilga aylantiramiz.",
  },
  {
    number: "02",
    title: "Ishonchlilik",
    text: "Taqdim etilgan ma’lumotlarni aniq, tushunarli va o‘quvchi uchun foydali formatda berishga intilamiz.",
  },
  {
    number: "03",
    title: "Ilhom",
    text: "Turli sohalardagi yoshlar tajribasi boshqalarga yangi maqsad va tashabbuslar uchun namuna bo‘lishini istaymiz.",
  },
];

export default function HaqidaPage() {
  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-16 pt-24 text-white md:px-8 md:pb-22 md:pt-28">
        <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#0043a4]/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">
            O‘zBYE haqida
          </p>
          <h1 className="mt-4 max-w-4xl text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[72px]">
            Yoshlarning yutuqlarini vaqt bilan yo‘qolib ketmaydigan xotiraga aylantiramiz
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-white/70 md:text-lg md:leading-8">
            O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi — mamlakat rivojiga o‘z bilim, tashabbus va mehnati bilan hissa qo‘shayotgan yoshlar haqidagi ensiklopedik platforma.
          </p>
        </div>
      </header>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">
              Asosiy maqsad
            </p>
            <h2 className="mt-3 text-[36px] font-extrabold leading-[1.04] tracking-[-0.045em] md:text-[52px]">
              Bunyodkor yoshlarni topish, tanitish va hujjatlashtirish
            </h2>
          </div>
          <div className="space-y-6 text-base font-medium leading-8 text-slate-600 md:text-lg">
            <p>
              Platformada ta’lim, fan, texnologiya, ijod, sport, tadbirkorlik, volontyorlik va boshqa yo‘nalishlarda faol bo‘lgan yoshlar profillari jamlanadi.
            </p>
            <p>
              Har bir profil shunchaki qisqa post emas. U insonning kelib chiqishi, ta’limi, erishgan natijalari, qarashlari va kelajakdagi maqsadlarini bir joyga jamlaydigan ensiklopedik sahifa sifatida shakllantiriladi.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7fb] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-3">
            {values.map((item) => (
              <article key={item.number} className="rounded-[28px] border border-slate-200 bg-white p-7 md:p-8">
                <span className="text-xs font-extrabold text-[#0043a4]">{item.number}</span>
                <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">
              Qanday ishlaydi?
            </p>
            <h2 className="mt-3 text-[36px] font-extrabold leading-[1.04] tracking-[-0.045em] md:text-[52px]">
              Arizadan ensiklopedik profilgacha
            </h2>
            <div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["Ariza", "Nomzod o‘zi yoki tavsiya orqali platformaga murojaat qiladi."],
                ["Tahrir", "Ma’lumotlar aniqlashtiriladi va ensiklopedik formatga keltiriladi."],
                ["Nashr", "Tayyor profil platformada qidirish va ulashish mumkin bo‘lgan sahifa sifatida e’lon qilinadi."],
              ].map(([title, text]) => (
                <div key={title} className="grid gap-2 py-5 sm:grid-cols-[160px_1fr]">
                  <h3 className="font-extrabold text-[#111827]">{title}</h3>
                  <p className="text-sm font-medium leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-[#071426] p-8 text-white md:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50">Siz ham qatnashing</p>
            <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.035em]">
              Sizning yo‘lingiz ham boshqalarga ilhom bo‘lishi mumkin.
            </h3>
            <p className="mt-4 text-sm font-medium leading-6 text-white/65">
              Ariza yuboring. Tahririyat ma’lumotlaringizni ko‘rib chiqib, keyingi bosqich bo‘yicha siz bilan bog‘lanadi.
            </p>
            <Link href="/ariza-qoldrish" className="mt-7 inline-flex rounded-full bg-[#0043a4] px-6 py-3.5 text-sm font-extrabold text-white">
              Ariza qoldirish →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
