import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Hamkor loyihasi",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining hamkorlik loyihalari va hamkorlar uchun ma’lumotlar sahifasi.",
  alternates: { canonical: "/hamkor-loyihasi" },
  openGraph: {
    title: "Hamkor loyihasi",
    description:
      "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi bilan hamkorlik imkoniyatlari.",
    url: "/hamkor-loyihasi",
    type: "website",
  },
};

export default function HamkorLoyihasiPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <section className="bg-[#071426] px-4 pb-8 pt-28 text-white md:px-8 md:pb-10 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/55">Hamkorlik</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">Hamkor loyihasi</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-white/70 md:text-base">
            Ensiklopediya bilan hamkorlik qilish, qo‘shma tashabbuslar va hamkorlar uchun
            mavjud imkoniyatlar haqida ma’lumot.
          </p>
        </div>
      </section>
      <iframe
        src="/tilda/hamkor-loyihasi.html"
        title="Hamkor loyihasi"
        className="block w-full border-0"
        style={{ height: "100dvh" }}
      />
    </main>
  );
}
