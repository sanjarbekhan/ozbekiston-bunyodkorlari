import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";

export const metadata: Metadata = {
  title: "Ommaviy oferta",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasida biografik maqola joylashtirish bo‘yicha amaldagi ommaviy oferta shartnomasi.",
  alternates: { canonical: "/ommaviy_ofertasi" },
  openGraph: {
    title: "O‘zBYE ommaviy ofertasi",
    description:
      "Biografik maqola joylashtirish bo‘yicha amaldagi ommaviy oferta shartnomasi.",
    url: "/ommaviy_ofertasi",
  },
};

async function getOfferHtml() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "tilda",
    "ommaviy_ofertasi.html"
  );
  const html = await readFile(filePath, "utf8");
  const startMarker = '<div field="text" class="t-text t-text_md ">';
  const endMarker = "</div> </div> </div> </div> </div> <!--footer-->";
  const start = html.indexOf(startMarker);
  if (start === -1) return "";
  const contentStart = start + startMarker.length;
  const end = html.indexOf(endMarker, contentStart);
  if (end === -1) return "";
  return html.slice(contentStart, end);
}

export default async function OmmaviyOfertaPage() {
  const offerHtml = await getOfferHtml();

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="bg-[#071426] px-4 pb-14 pt-24 text-white md:px-8 md:pb-18 md:pt-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/55">
            Huquqiy hujjat
          </p>
          <h1 className="mt-4 text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[68px]">
            Ommaviy oferta
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-white/70 md:text-lg md:leading-8">
            O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasida biografik maqola joylashtirish bo‘yicha amaldagi shartnoma.
          </p>
        </div>
      </header>

      <section className="px-4 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,.05)] sm:p-8 md:p-12">
          {offerHtml ? (
            <div
              className="legal-copy text-[15px] font-medium leading-7 text-slate-700 md:text-base md:leading-8 [&_a]:font-extrabold [&_a]:text-[#0043a4] [&_a]:underline [&_br]:leading-8 [&_li]:mb-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-7 [&_p]:text-xl [&_p]:font-extrabold [&_p]:tracking-[-0.02em] [&_p]:text-[#111827] [&_strong]:font-extrabold [&_strong]:text-[#111827] [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: offerHtml }}
            />
          ) : (
            <div className="rounded-2xl bg-amber-50 p-6 text-sm font-semibold leading-6 text-amber-900">
              Oferta matnini yuklab bo‘lmadi. Amaldagi hujjatni tahririyatdan so‘rashingiz mumkin.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
