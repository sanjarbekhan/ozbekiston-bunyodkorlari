import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteMenu from "@/components/SiteMenu";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Iqtiboslar",
  description:
    "O‘zbekiston Bunyodkor Yoshlari Ensiklopediyasi qahramonlarining hayotiy prinsip va tavsiyalaridan tanlangan iqtiboslar.",
  alternates: { canonical: "/sahifasi" },
  openGraph: {
    title: "Bunyodkorlardan iqtiboslar",
    description: "Bunyodkor yoshlarning hayotiy prinsip, maqsad va tavsiyalaridan tanlangan fikrlar.",
    url: "/sahifasi",
  },
};

type QuoteBlock = {
  ty?: string;
  te?: string;
  author?: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  content_blocks: QuoteBlock[] | null;
  content: string | null;
};

function cleanText(value?: string | null) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuote(article: Article) {
  const blocks = Array.isArray(article.content_blocks) ? article.content_blocks : [];
  const explicit = blocks.find((block) => block.ty === "quote" && cleanText(block.te).length >= 25);
  if (explicit) return cleanText(explicit.te);

  const source = [
    ...blocks.map((block) => block.te || ""),
    article.content || "",
  ]
    .map(cleanText)
    .join(" ");

  const matches = Array.from(source.matchAll(/[“"]([^”"]{35,280})[”"]/g))
    .map((match) => cleanText(match[1]))
    .filter((quote) => {
      const lower = quote.toLocaleLowerCase("uz");
      return (
        quote.length >= 35 &&
        quote.length <= 280 &&
        !lower.includes("ko‘krak nishoni") &&
        !lower.includes("ko'krak nishoni") &&
        !lower.includes("zakovat quiz")
      );
    })
    .sort((a, b) => b.length - a.length);

  return matches[0] || "";
}

export default async function SahifasiPage() {
  const { data } = await supabase
    .from("articles")
    .select("id,title,slug,image_url,content_blocks,content")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(80);

  const quotes = ((data || []) as Article[])
    .map((article) => ({ ...article, quote: extractQuote(article) }))
    .filter((article) => article.quote)
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#111827]">
      <SiteMenu />

      <header className="bg-white px-4 pb-14 pt-24 md:px-8 md:pb-18 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#0043a4]">
            Fikrlar
          </p>
          <h1 className="mt-4 max-w-4xl text-[42px] font-extrabold leading-[1] tracking-[-0.05em] sm:text-[56px] md:text-[72px]">
            Bunyodkorlardan iqtiboslar
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-7 text-slate-600 md:text-lg md:leading-8">
            Profillarda keltirilgan hayotiy prinsip, maqsad va yoshlarga tavsiyalardan tanlangan fikrlar.
          </p>
        </div>
      </header>

      <section className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          {quotes.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {quotes.map((article) => (
                <Link
                  key={article.id}
                  href={`/bunyodkorlar/${article.slug}`}
                  className="group flex min-h-[360px] flex-col rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,.08)] md:p-8"
                >
                  <div className="text-6xl font-extrabold leading-none text-[#0043a4]/14">“</div>
                  <blockquote className="mt-2 line-clamp-7 text-xl font-semibold leading-8 tracking-[-0.02em] text-[#172033]">
                    {article.quote}
                  </blockquote>

                  <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-6">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-sm font-extrabold leading-5 text-[#111827]">
                        {article.title}
                      </h2>
                      <p className="mt-1 text-xs font-semibold text-[#0043a4]">
                        Profilni o‘qish <span className="transition group-hover:ml-1">→</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-extrabold">Hozircha iqtibos topilmadi</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">
                Profil matnlarida alohida iqtiboslar ko‘paygani sari bu sahifa avtomatik to‘lib boradi.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-20 pt-4 md:px-8 md:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[32px] bg-[#071426] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/50">Ko‘proq hikoyalar</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-4xl">
              Iqtibos ortidagi to‘liq yo‘lni profil sahifalarida o‘qing.
            </h2>
          </div>
          <Link href="/bunyodkorlar" className="inline-flex shrink-0 rounded-full bg-[#0043a4] px-7 py-4 text-sm font-extrabold text-white">
            Bunyodkorlar katalogi →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
