import type { Metadata } from "next";
import Image from "next/image";
import BiographyApplicationForm from "@/components/BiographyApplicationForm";
import SiteMenu from "@/components/SiteMenu";
import { normalizeTelegram } from "@/lib/biography-application";

export const metadata: Metadata = {
  title: "Biografik anketa | O‘zbekiston Bunyodkor Yoshlari",
  description: "Ensiklopediya maqolangiz uchun biografik ma’lumotlar, rasm va ijtimoiy tarmoq havolalarini yuboring.",
  alternates: { canonical: "https://www.bunyodkor.com/anketa" },
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ telegram?: string | string[] }>;
};

export default async function BiographyApplicationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawTelegram = Array.isArray(params.telegram) ? params.telegram[0] : params.telegram;
  const initialTelegram = normalizeTelegram(rawTelegram);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e8f1ff_0,transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f3f6fb_52%,#ffffff_100%)] text-[#101828]">
      <SiteMenu />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
        <div className="grid items-start gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[30px] bg-[#071426] p-6 text-white shadow-[0_24px_70px_rgba(7,20,38,.18)] sm:p-8">
              <Image
                src="/tilda/images/ozbye-new-logo.svg"
                alt="O‘zbekiston Bunyodkor Yoshlari"
                width={230}
                height={44}
                className="h-11 w-auto max-w-[230px] rounded-lg bg-white px-3 py-2 object-contain"
              />
              <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-[#74a9ff]">Biografik maqola</p>
              <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-[-0.045em] sm:text-4xl">
                Hikoyangizni tartibli va to‘liq yuboring
              </h1>
              <p className="mt-4 text-sm font-medium leading-6 text-white/65 sm:text-[15px]">
                Javoblaringiz asosida tahririyat siz haqingizdagi professional biografik maqolani tayyorlaydi.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["15", "aniq savol"],
                  ["~20 min", "to‘ldirish vaqti"],
                  ["Avtomatik", "qoralama saqlash"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3.5">
                    <p className="text-lg font-black">{value}</p>
                    <p className="mt-0.5 text-xs font-bold text-white/45">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl bg-[#0f68ff]/20 p-4 text-sm font-semibold leading-6 text-blue-100">
                Ma’lumotlarni yuborishdan oldin barcha javoblarni oxirgi bosqichda yana bir bor tekshirishingiz mumkin.
              </div>
            </div>

            <p className="px-3 pt-4 text-center text-xs font-medium leading-5 text-slate-400 lg:text-left">
              Texnik yordam: <a href="https://t.me/bunyodkor_cv" className="font-extrabold text-[#0043a4]">@bunyodkor_cv</a>
            </p>
          </aside>

          <BiographyApplicationForm initialTelegram={initialTelegram} />
        </div>
      </section>
    </main>
  );
}
