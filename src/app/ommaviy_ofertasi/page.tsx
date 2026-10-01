import type { Metadata } from "next";
import SiteMenu from "@/components/SiteMenu";
import LegacyOfferFrame from "@/components/LegacyOfferFrame";

export const metadata: Metadata = {
  title: "Ommaviy oferta",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi xizmatlaridan foydalanish bo‘yicha ommaviy oferta shartlari.",
  alternates: { canonical: "/ommaviy_ofertasi" },
  openGraph: {
    title: "Ommaviy oferta",
    description:
      "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasining ommaviy oferta shartlari.",
    url: "/ommaviy_ofertasi",
    type: "website",
  },
};

export default function OmmaviyOfertaPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteMenu />
      <section className="bg-[#f4f7fb] px-4 pb-7 pt-28 md:px-8 md:pb-9 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0043a4]">Huquqiy hujjat</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#111827] md:text-5xl">Ommaviy oferta</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-600 md:text-base">
            Platforma xizmatlari, tomonlarning huquq va majburiyatlari hamda foydalanish
            shartlari ushbu hujjatda bayon etilgan.
          </p>
        </div>
      </section>
      <LegacyOfferFrame />
    </main>
  );
}
