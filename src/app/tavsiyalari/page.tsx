import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Tavsiyalar",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga profil tayyorlash va ma’lumotlarni taqdim etish bo‘yicha tavsiyalar.",
  alternates: { canonical: "/tavsiyalari" },
  openGraph: {
    title: "O‘zBYE tavsiyalari",
    description: "Ensiklopedik profil uchun ma’lumot, rasm va yutuqlarni to‘g‘ri tayyorlash bo‘yicha tavsiyalar.",
    url: "/tavsiyalari",
  },
};

const recommendations = [
  {
    title: "Ma’lumot aniq bo‘lsin",
    text: "Ism-familiya, ta’lim muassasasi, faoliyat yo‘nalishi, sana va yutuqlarni imkon qadar aniq yozing. Taxminiy yoki tekshirilmagan ma’lumotlarni yubormang.",
  },
  {
    title: "Muhim natijalarni ajrating",
    text: "Barcha sertifikatlarni sanash o‘rniga sizning rivojlanishingizni eng yaxshi ko‘rsatadigan yutuq, loyiha, tanlov, ilmiy ish yoki tashabbuslarni birinchi o‘ringa qo‘ying.",
  },
  {
    title: "Sifatli portret yuboring",
    text: "Yuz aniq ko‘rinadigan, yorug‘ligi yaxshi, keraksiz yozuv va kuchli filtrsiz vertikal yoki kvadrat portret ensiklopediya kartalarida yaxshiroq ko‘rinadi.",
  },
  {
    title: "Dalillarni saqlang",
    text: "Zarur bo‘lganda yutuqlarni tasdiqlash uchun sertifikat, diplom, havola yoki rasmiy manbani taqdim etishga tayyor bo‘ling.",
  },
  {
    title: "Shaxsiy fikringizni yozing",
    text: "Hayotiy prinsip, maqsad, yoshlarga tavsiya va sizga ta’sir qilgan insonlar haqidagi qisqa, o‘zingizga xos javoblar profilni jonli qiladi.",
  },
  {
    title: "Kontaktni to‘g‘ri kiriting",
    text: "Tahririyat aniqlashtirish uchun siz bilan bog‘lanishi mumkin. Telefon yoki Telegram kontaktini xatosiz yuboring.",
  },
];

export default function TavsiyalariPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="bg-white px-4 pb-14 pt-24 md:px-8 md:pb-18 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0043a4]">
            Profil tayyorlash
          </p>
          <h1 className="mt-4 max-w-4xl text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[72px]">
            Yaxshi ensiklopedik profil yaxshi tayyorlangan ma’lumotdan boshlanadi
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-slate-600 md:text-lg md:leading-8">
            Quyidagi tavsiyalar arizani tezroq ko‘rib chiqish va yakuniy profilni aniq, o‘qilishi oson hamda ishonchli qilishga yordam beradi.
          </p>
        </div>
      </header>

      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((item, index) => (
            <article key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,.04)] md:p-8">
              <span className="text-xs font-extrabold text-[#0043a4]">0{index + 1}</span>
              <h2 className="mt-7 text-2xl font-extrabold leading-tight tracking-[-0.03em]">{item.title}</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 pt-4 md:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-[#071426] p-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:p-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50">Tayyor bo‘lsangiz</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-4xl">
              Ma’lumotlaringizni yuboring, keyingi bosqichni tahririyat bilan davom ettiring.
            </h2>
          </div>
          <Link href="/ariza-qoldrish" className="mt-7 inline-flex shrink-0 rounded-full bg-[#0043a4] px-7 py-4 text-sm font-extrabold text-white md:mt-0">
            Ariza qoldirish →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
