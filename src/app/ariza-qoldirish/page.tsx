import type { Metadata } from "next";
import ApplicationForm from "@/components/ApplicationForm";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Ariza qoldirish",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
  alternates: { canonical: "/ariza-qoldirish" },
  openGraph: {
    title: "Ariza qoldirish",
    description:
      "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
    url: "/ariza-qoldirish",
  },
};

export default function ArizaQoldirishPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="relative overflow-hidden bg-[#071426] px-4 pb-14 pt-28 text-white md:px-8 md:pb-18 md:pt-32 xl:pt-36">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#1677ff]/25 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#77b3ff]">
            Ensiklopediyaga qo‘shiling
          </p>
          <h1 className="mt-4 max-w-4xl text-[42px] font-black leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[68px]">
            Ariza qoldirish
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-white/72 md:text-lg md:leading-8">
            Asosiy aloqa ma’lumotlaringizni yuboring. Tahririyat arizani ko‘rib chiqib,
            keyingi bosqich bo‘yicha siz bilan bog‘lanadi.
          </p>
        </div>
      </header>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-5xl gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
          <ApplicationForm />

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)] md:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0043a4]">
              Jarayon
            </p>
            <div className="mt-5 space-y-5">
              {[
                ["01", "Arizani yuborasiz", "Ism, aloqa va asosiy ma’lumotlarni qoldirasiz."],
                ["02", "Tahririyat ko‘rib chiqadi", "Ma’lumotlar tekshiriladi va zarur bo‘lsa aniqlashtiriladi."],
                ["03", "Profil tayyorlanadi", "Tasdiqlangan ma’lumotlar ensiklopedik formatga keltiriladi."],
              ].map(([number, title, text]) => (
                <div key={number} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-xs font-black text-[#0043a4]">
                    {number}
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-[#10233d]">{title}</h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-[#f6f9fd] p-4 text-xs font-medium leading-5 text-slate-500">
              18 yoshga to‘lmagan nomzodlarning ochiq profilida aniq tug‘ilgan kun va oy kabi
              ortiqcha shaxsiy ma’lumotlar ko‘rsatilmaydi.
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
