import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import ApplicationForm from "@/components/ApplicationForm";

export const metadata: Metadata = {
  title: "Ariza qoldirish | O‘zbekiston Bunyodkor Yoshlari",
  description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
  alternates: { canonical: "https://www.bunyodkor.com/ariza-qoldrish" },
  openGraph: {
    title: "Ariza qoldirish | O‘zbekiston Bunyodkor Yoshlari",
    description: "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasiga qo‘shilish uchun ariza yuboring.",
    url: "https://www.bunyodkor.com/ariza-qoldrish",
  },
};

export default function ArizaQoldirishPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101828]">
      <SiteMenu />
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="mb-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0043a4]">O‘zBYE</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Ariza qoldirish</h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-slate-500">
            Ma’lumotlaringizni yuboring. Arizangiz to‘g‘ridan-to‘g‘ri O‘zBYE admin paneliga kelib tushadi va ko‘rib chiqilgach siz bilan bog‘lanamiz.
          </p>
        </div>
        <ApplicationForm />
      </section>
    </main>
  );
}
